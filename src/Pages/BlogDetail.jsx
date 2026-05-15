import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaCommentDots, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { GiBee } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import {
  getBlogBySlug,
  getBlog,
  toggleLike,
  addComment,
  deleteComment,
  subscribeToComments,
  subscribeToBlog,
  subscribeToUserLike,
} from '../services/blogService';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { LottieLoader } from '../components/LoadingSpinner';
import LoginPromptModal from '../components/LoginPromptModal';
import Toast from '../components/Toast';
import { useSEO } from '../utils/useSEO';

const SITE_NAME = 'Laxmi Honey Industry';

const stripPlain = (str = '') => str.replace(/\s+/g, ' ').trim();
const tsToISO = (ts) => {
  if (!ts) return undefined;
  if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
  if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const formatDateTime = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptAction, setPromptAction] = useState('continue');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const commentsRef = useRef(null);

  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  // SEO meta for this post. Runs only when blog data is available.
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const seoTitle = blog ? `${blog.title} | ${SITE_NAME}` : `Loading… | ${SITE_NAME}`;
  const seoDesc = blog ? stripPlain(blog.excerpt || blog.content || '').slice(0, 160) : '';
  const seoImage = blog?.image?.url
    ? getOptimizedImageUrl(blog.image.url, { width: 1200, height: 630 })
    : '';
  const publishedISO = tsToISO(blog?.createdAt);
  const modifiedISO = tsToISO(blog?.updatedAt) || publishedISO;
  const jsonLd = blog
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: seoDesc,
        image: seoImage ? [seoImage] : undefined,
        author: {
          '@type': 'Person',
          name: blog.author?.name || 'Laxmi Honey',
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: origin
            ? { '@type': 'ImageObject', url: `${origin}/logo.png` }
            : undefined,
        },
        datePublished: publishedISO,
        dateModified: modifiedISO,
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        keywords: (blog.tags || []).join(', '),
        articleSection: blog.category,
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: blog.likesCount || 0,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: blog.commentsCount || 0,
          },
        ],
      }
    : null;

  useSEO({
    title: seoTitle,
    description: seoDesc,
    image: seoImage,
    url: pageUrl,
    type: 'article',
    publishedTime: publishedISO,
    modifiedTime: modifiedISO,
    author: blog?.author?.name,
    tags: blog?.tags,
    jsonLd,
  });

  // Resolve the doc id (route param could be a legacy slug) then subscribe.
  useEffect(() => {
    let cancelled = false;
    let unsubBlog = null;
    setLoading(true);
    setNotFound(false);

    const resolveAndSubscribe = async () => {
      try {
        let docId = id;
        const direct = await getBlog(id);
        if (!direct) {
          const bySlug = await getBlogBySlug(id);
          if (bySlug) docId = bySlug.id;
          else {
            if (!cancelled) {
              setNotFound(true);
              setLoading(false);
            }
            return;
          }
        }
        if (cancelled) return;
        // Subscribe for live counts / edits / unpublish.
        unsubBlog = subscribeToBlog(docId, (data) => {
          if (!data) {
            setNotFound(true);
            setBlog(null);
          } else {
            setBlog(data);
            setNotFound(false);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to load blog', err);
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    resolveAndSubscribe();
    return () => {
      cancelled = true;
      if (unsubBlog) unsubBlog();
    };
  }, [id]);

  // Realtime liked state for current user
  useEffect(() => {
    if (!blog || !user) {
      setLiked(false);
      return;
    }
    const unsub = subscribeToUserLike(blog.id, user.uid, setLiked);
    return () => unsub && unsub();
  }, [blog, user]);

  // Subscribe to comments live
  useEffect(() => {
    if (!blog || !blog.commentsEnabled) return;
    const unsub = subscribeToComments(blog.id, setComments);
    return () => unsub && unsub();
  }, [blog]);

  // Scroll to comments if #comments hash
  useEffect(() => {
    if (!loading && blog && window.location.hash === '#comments' && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, blog]);

  const requireLogin = (action) => {
    setPromptAction(action);
    setPromptOpen(true);
  };

  const handleLike = async () => {
    if (!blog?.likesEnabled) return;
    if (!user) return requireLogin('like this post');
    if (likePending) return;
    setLikePending(true);

    const wasLiked = liked;
    setLiked(!wasLiked);
    setBlog((b) => ({ ...b, likesCount: (b.likesCount || 0) + (wasLiked ? -1 : 1) }));

    try {
      await toggleLike(blog.id, user);
    } catch (err) {
      console.error('Like failed', err);
      setLiked(wasLiked);
      setBlog((b) => ({ ...b, likesCount: (b.likesCount || 0) + (wasLiked ? 1 : -1) }));
      showToast('error', 'Could not update like. Please try again.');
    } finally {
      setLikePending(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!blog?.commentsEnabled) return;
    const text = commentText.trim();
    if (!text) return;
    if (!user) return requireLogin('post a comment');
    setPostingComment(true);
    try {
      await addComment(blog.id, user, text);
      setCommentText('');
      setBlog((b) => ({ ...b, commentsCount: (b.commentsCount || 0) + 1 }));
      showToast('success', 'Comment posted');
    } catch (err) {
      console.error('Comment failed', err);
      showToast('error', err.message || 'Could not post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(blog.id, commentId);
      setBlog((b) => ({ ...b, commentsCount: Math.max((b.commentsCount || 0) - 1, 0) }));
      showToast('success', 'Comment deleted');
    } catch (err) {
      console.error('Delete failed', err);
      showToast('error', 'Could not delete comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-24">
        <LottieLoader text="Loading post..." />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-24 px-4">
        <GiBee className="w-20 h-20 text-amber-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Post not found</h1>
        <p className="text-gray-600 mb-6 text-center">This post may have been removed or unpublished.</p>
        <button
          onClick={() => navigate('/blogs')}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <LoginPromptModal isOpen={promptOpen} onClose={() => setPromptOpen(false)} action={promptAction} />

      <article className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-3xl">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold mb-4 sm:mb-6 text-sm sm:text-base min-h-[40px]"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to blogs
        </Link>

        {blog.image?.url && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-6 sm:mb-8 bg-gradient-to-br from-amber-100 to-orange-100 aspect-[16/9]">
            <img
              src={getOptimizedImageUrl(blog.image.url, { width: 1200, height: 675 })}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2.5 sm:px-3 py-1 rounded-full">
            {blog.category || 'General'}
          </span>
          {(blog.tags || []).map((tag) => (
            <span key={tag} className="text-[10px] sm:text-xs text-gray-500">
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-500">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(blog.author?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{blog.author?.name || 'Admin'}</p>
            <p className="text-xs">{formatDateTime(blog.createdAt)}</p>
          </div>
        </div>

        {blog.excerpt && (
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-5 sm:mb-6 border-l-4 border-amber-400 pl-3 sm:pl-4 italic">
            {blog.excerpt}
          </p>
        )}

        <div className="max-w-none text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {blog.content}
        </div>

        {/* Likes bar */}
        {blog.likesEnabled !== false && (
          <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-b border-gray-200 py-4 sm:py-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={likePending}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full font-semibold transition-colors text-sm sm:text-base min-h-[44px] ${
                liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-60`}
            >
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              <span>{liked ? 'Liked' : 'Like'}</span>
              <span className="text-gray-500">· {blog.likesCount || 0}</span>
            </motion.button>
            {blog.commentsEnabled !== false && (
              <a
                href="#comments"
                onClick={(e) => {
                  e.preventDefault();
                  commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 font-semibold transition-colors text-sm sm:text-base min-h-[44px]"
              >
                <FaCommentDots />
                <span>Comments</span>
                <span className="text-gray-500">· {blog.commentsCount || 0}</span>
              </a>
            )}
          </div>
        )}

        {/* Comments */}
        {blog.commentsEnabled !== false && (
          <section ref={commentsRef} id="comments" className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Comments ({comments.length})
            </h2>

            <form
              onSubmit={handleAddComment}
              className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 md:p-5 border border-amber-100"
            >
              {!user ? (
                <button
                  type="button"
                  onClick={() => requireLogin('post a comment')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300 text-gray-500 rounded-xl transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Sign in to leave a comment...
                </button>
              ) : (
                <>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Comment as ${user.displayName || user.email}...`}
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none text-sm sm:text-base"
                  />
                  <div className="flex items-center justify-between mt-3 gap-3">
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {commentText.length}/1000
                    </span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || postingComment}
                      className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow disabled:opacity-60 text-sm sm:text-base min-h-[40px] whitespace-nowrap"
                    >
                      {postingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 space-y-4">
              <AnimatePresence>
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Be the first to share your thoughts.
                  </p>
                ) : (
                  comments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                          {c.userPhotoURL ? (
                            <img src={c.userPhotoURL} alt={c.userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (c.userName || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate max-w-[60vw]">{c.userName}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400">{formatDateTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                        </div>
                        {(isAdmin || (user && user.uid === c.userId)) && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-2 -m-2"
                            aria-label="Delete comment"
                          >
                            <FaTrash className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default BlogDetail;
