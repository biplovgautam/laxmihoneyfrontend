import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaCommentDots, FaSearch } from 'react-icons/fa';
import { GiBee } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { subscribeToBlogs, hasUserLiked, toggleLike } from '../services/blogService';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { LottieLoader } from '../components/LoadingSpinner';
import LoginPromptModal from '../components/LoginPromptModal';
import { useSEO } from '../utils/useSEO';

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Blogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [likedMap, setLikedMap] = useState({});
  const [pendingLikes, setPendingLikes] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('continue');

  useSEO({
    title: 'Blog | Laxmi Honey Industry',
    description:
      'Stories, tips and sweet insights from Laxmi Honey — beekeeping wisdom, honey recipes, health benefits, and the journey from hive to table.',
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Laxmi Honey Blog',
      description:
        'Honey wisdom, beekeeping tales, and wellness know-how from Laxmi Honey Industry.',
    },
  });

  useEffect(() => {
    // Realtime: list updates instantly when likesCount / commentsCount change
    // on any blog, or when admin publishes / unpublishes / edits.
    const unsub = subscribeToBlogs(
      (data) => {
        setBlogs(data);
        setLoading(false);
      },
      { onlyPublished: true }
    );
    return () => unsub && unsub();
  }, []);

  // Resolve per-blog "liked" status once user + blogs available
  useEffect(() => {
    if (!user || blogs.length === 0) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        blogs.map(async (b) => [b.id, await hasUserLiked(b.id, user.uid)])
      );
      if (cancelled) return;
      setLikedMap(Object.fromEntries(results));
    })();
    return () => {
      cancelled = true;
    };
  }, [user, blogs]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    blogs.forEach((b) => b.category && set.add(b.category));
    return Array.from(set);
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchCat = activeCategory === 'All' || b.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [blogs, search, activeCategory]);

  const handleLike = async (blog, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!blog.likesEnabled) return;
    if (!user) {
      setPromptAction('like this post');
      setShowLoginPrompt(true);
      return;
    }
    if (pendingLikes[blog.id]) return;
    setPendingLikes((p) => ({ ...p, [blog.id]: true }));

    const wasLiked = !!likedMap[blog.id];
    // optimistic
    setLikedMap((m) => ({ ...m, [blog.id]: !wasLiked }));
    setBlogs((list) =>
      list.map((b) =>
        b.id === blog.id ? { ...b, likesCount: (b.likesCount || 0) + (wasLiked ? -1 : 1) } : b
      )
    );

    try {
      await toggleLike(blog.id, user);
    } catch (err) {
      console.error('Like failed', err);
      // revert
      setLikedMap((m) => ({ ...m, [blog.id]: wasLiked }));
      setBlogs((list) =>
        list.map((b) =>
          b.id === blog.id ? { ...b, likesCount: (b.likesCount || 0) + (wasLiked ? 1 : -1) } : b
        )
      );
    } finally {
      setPendingLikes((p) => ({ ...p, [blog.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero header */}
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute top-0 -left-20 w-60 sm:w-80 h-60 sm:h-80 bg-amber-300 rounded-full mix-blend-overlay filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 -right-20 w-60 sm:w-80 h-60 sm:h-80 bg-orange-300 rounded-full mix-blend-overlay filter blur-3xl opacity-40"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <GiBee className="w-4 h-4" />
              From the Hive
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              Stories, Tips & Sweet Insights
            </h1>
            <p className="text-amber-100 text-sm sm:text-base md:text-lg lg:text-xl px-2">
              Honey wisdom, beekeeping tales, and wellness know-how — straight from Laxmi Honey.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 -mt-6 sm:-mt-8 pb-12 sm:pb-16 relative">
        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 md:items-center"
        >
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-100 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 rounded-xl outline-none transition-colors text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 md:overflow-visible md:flex-wrap scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                  activeCategory === c
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LottieLoader text="Loading posts..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <GiBee className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-amber-300 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1">No posts found</h3>
            <p className="text-sm sm:text-base text-gray-500">
              {blogs.length === 0
                ? 'Posts will appear here once they are published.'
                : 'Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((blog, idx) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                index={idx}
                liked={!!likedMap[blog.id]}
                onLike={(e) => handleLike(blog, e)}
              />
            ))}
          </div>
        )}
      </div>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={promptAction}
      />
    </div>
  );
};

const BlogCard = ({ blog, index, liked, onLike }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden transition-shadow duration-300 flex flex-col group"
    >
      <Link to={`/blog/${blog.id}`} className="block relative">
        <div className="aspect-[16/10] bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
          {blog.image?.url ? (
            <img
              src={getOptimizedImageUrl(blog.image.url, { width: 600, height: 380 })}
              alt={blog.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-400">
              <GiBee className="w-16 h-16" />
            </div>
          )}
        </div>
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold bg-white/95 text-amber-700 px-3 py-1 rounded-full shadow">
          {blog.category || 'General'}
        </span>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
          <span className="font-medium text-amber-700 truncate max-w-[60%]">{blog.author?.name || 'Admin'}</span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>

        <Link to={`/blog/${blog.id}`}>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 hover:text-amber-700 transition-colors leading-snug">
            {blog.title}
          </h2>
        </Link>

        {blog.excerpt && (
          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 sm:line-clamp-3">{blog.excerpt}</p>
        )}

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
            {blog.likesEnabled !== false && (
              <button
                onClick={onLike}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors min-h-[36px] px-1"
                aria-label="Like"
              >
                {liked ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
                <span className="font-medium text-xs sm:text-sm">{blog.likesCount || 0}</span>
              </button>
            )}
            {blog.commentsEnabled !== false && (
              <Link
                to={`/blog/${blog.id}#comments`}
                className="flex items-center gap-1.5 hover:text-amber-600 transition-colors min-h-[36px] px-1"
              >
                <FaCommentDots />
                <span className="font-medium text-xs sm:text-sm">{blog.commentsCount || 0}</span>
              </Link>
            )}
          </div>
          <Link
            to={`/blog/${blog.id}`}
            className="text-amber-600 hover:text-amber-700 font-semibold text-xs sm:text-sm whitespace-nowrap"
          >
            Read →
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default Blogs;
