// Blog CRUD + likes + comments service
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BLOGS = 'blogs';

const slugify = (str) =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export const buildSlug = (title) => {
  const base = slugify(title);
  // Append short timestamp suffix to keep slugs unique
  return `${base}-${Date.now().toString(36).slice(-4)}`;
};

// ---------- BLOG CRUD ----------

export const createBlog = async (data, author) => {
  const slug = data.slug || buildSlug(data.title);
  const payload = {
    title: data.title,
    slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    image: data.image || null, // { url, publicId }
    category: data.category || 'General',
    tags: Array.isArray(data.tags) ? data.tags : [],
    likesEnabled: data.likesEnabled !== false,
    commentsEnabled: data.commentsEnabled !== false,
    isPublished: data.isPublished !== false,
    likesCount: 0,
    commentsCount: 0,
    author: {
      uid: author?.uid || '',
      name: author?.displayName || author?.fullName || author?.email || 'Admin',
      role: author?.role || 'Admin',
      photoURL: author?.photoURL || '',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, BLOGS), payload);
  return { id: ref.id, ...payload };
};

export const updateBlog = async (id, data) => {
  const ref = doc(db, BLOGS, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBlog = async (id) => {
  await deleteDoc(doc(db, BLOGS, id));
};

export const getBlog = async (id) => {
  const snap = await getDoc(doc(db, BLOGS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getBlogBySlug = async (slug) => {
  const q = query(collection(db, BLOGS), where('slug', '==', slug), fbLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

export const listBlogs = async ({ onlyPublished = true, max = 200 } = {}) => {
  // Fetch all blogs and sort/filter client-side. Avoids:
  // - Composite index requirement for compound where+orderBy
  // - Firestore orderBy excluding docs where the field is null (e.g. a doc
  //   just written via serverTimestamp() that hasn't resolved yet).
  const snap = await getDocs(query(collection(db, BLOGS), fbLimit(max)));
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const toMs = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    return new Date(ts).getTime() || 0;
  };

  const sorted = all.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
  return onlyPublished ? sorted.filter((b) => b.isPublished !== false) : sorted;
};

// ---------- BLOG REALTIME ----------

// Live subscription to a single blog doc (so likesCount + commentsCount
// update instantly across clients without polling).
export const subscribeToBlog = (blogId, callback) =>
  onSnapshot(doc(db, BLOGS, blogId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  });

// Live subscription to the entire blogs collection (for the public listing
// and admin grid). Sorted/filtered client-side to avoid composite index.
export const subscribeToBlogs = (callback, { onlyPublished = true } = {}) => {
  const q = query(collection(db, BLOGS), fbLimit(200));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const toMs = (ts) => {
      if (!ts) return 0;
      if (typeof ts.toMillis === 'function') return ts.toMillis();
      if (ts.seconds) return ts.seconds * 1000;
      return new Date(ts).getTime() || 0;
    };
    const sorted = all.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    callback(onlyPublished ? sorted.filter((b) => b.isPublished !== false) : sorted);
  });
};

// ---------- LIKES ----------

export const hasUserLiked = async (blogId, userId) => {
  if (!blogId || !userId) return false;
  const snap = await getDoc(doc(db, BLOGS, blogId, 'likes', userId));
  return snap.exists();
};

// Live subscription to whether a specific user has liked a blog.
export const subscribeToUserLike = (blogId, userId, callback) => {
  if (!blogId || !userId) {
    callback(false);
    return () => {};
  }
  return onSnapshot(doc(db, BLOGS, blogId, 'likes', userId), (snap) => {
    callback(snap.exists());
  });
};

export const toggleLike = async (blogId, user) => {
  if (!user?.uid) throw new Error('Not signed in');
  const likeRef = doc(db, BLOGS, blogId, 'likes', user.uid);
  const blogRef = doc(db, BLOGS, blogId);
  const existing = await getDoc(likeRef);

  if (existing.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(blogRef, { likesCount: increment(-1) });
    return { liked: false };
  }

  await setDoc(likeRef, {
    userId: user.uid,
    userName: user.displayName || user.email || 'User',
    createdAt: serverTimestamp(),
  });
  await updateDoc(blogRef, { likesCount: increment(1) });
  return { liked: true };
};

// ---------- COMMENTS ----------

export const addComment = async (blogId, user, content) => {
  if (!user?.uid) throw new Error('Not signed in');
  const trimmed = (content || '').trim();
  if (!trimmed) throw new Error('Comment is empty');
  if (trimmed.length > 1000) throw new Error('Comment too long (max 1000 chars)');

  const ref = await addDoc(collection(db, BLOGS, blogId, 'comments'), {
    userId: user.uid,
    userName: user.displayName || user.email || 'User',
    userPhotoURL: user.photoURL || '',
    content: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, BLOGS, blogId), { commentsCount: increment(1) });
  return { id: ref.id };
};

export const deleteComment = async (blogId, commentId) => {
  await deleteDoc(doc(db, BLOGS, blogId, 'comments', commentId));
  await updateDoc(doc(db, BLOGS, blogId), { commentsCount: increment(-1) });
};

// Subscribe to comments in real-time. Returns unsubscribe fn.
export const subscribeToComments = (blogId, callback) => {
  const q = query(
    collection(db, BLOGS, blogId, 'comments'),
    orderBy('createdAt', 'desc'),
    fbLimit(100)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};
