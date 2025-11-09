import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GiBee } from 'react-icons/gi';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark, FaEllipsisH, FaPlus } from 'react-icons/fa';
import Blog1 from "../assets/Blogs/1.jpg";
import Blog2 from "../assets/Blogs/2.jpg";
import Blog3 from "../assets/Blogs/3.jpg";
import Blog4 from "../assets/Blogs/4.jpg";

const Blogs = () => {
  const [stories, setStories] = useState([
    { id: 1, author: "Laxmi Dhakal", avatar: null, image: Blog1, viewed: false },
    { id: 2, author: "Biplov Gautam", avatar: null, image: Blog2, viewed: false },
    { id: 3, author: "Bipin Gautam", avatar: null, image: Blog3, viewed: true },
    { id: 4, author: "Om Prakash", avatar: null, image: Blog4, viewed: false },
    { id: 5, author: "Barsha Gautam", avatar: null, image: Blog1, viewed: false },
  ]);

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: { name: "Laxmi Dhakal", role: "CEO & Founder", avatar: null },
      timestamp: "2 hours ago",
      caption: "The Sweet Journey of Pure Honey Production 🍯\\n\\nDiscover how our dedicated beekeepers work with nature to create the purest, most delicious honey while maintaining sustainable practices.",
      image: Blog1,
      likes: 234,
      comments: 45,
      isLiked: false,
      isSaved: false,
    },
    {
      id: 2,
      author: { name: "Biplov Gautam", role: "CTO & MD", avatar: null },
      timestamp: "5 hours ago",
      caption: "Health Benefits of Raw Unprocessed Honey 💚\\n\\nLearn about the incredible health benefits of consuming raw honey and how it can boost your immune system and overall wellness.",
      image: Blog2,
      likes: 189,
      comments: 32,
      isLiked: false,
      isSaved: false,
    },
    {
      id: 3,
      author: { name: "Bipin Gautam", role: "Operations Manager", avatar: null },
      timestamp: "1 day ago",
      caption: "Sustainable Beekeeping: Our Commitment to Nature 🌿\\n\\nExplore our eco-friendly beekeeping methods that support bee populations while producing premium quality honey products.",
      image: Blog3,
      likes: 312,
      comments: 56,
      isLiked: true,
      isSaved: true,
    },
    {
      id: 4,
      author: { name: "Om Prakash Gautam", role: "Production Manager", avatar: null },
      timestamp: "2 days ago",
      caption: "From Hive to Table: Our Quality Assurance Process ✓\\n\\nTake a behind-the-scenes look at our rigorous quality control process that ensures every jar meets our premium standards.",
      image: Blog4,
      likes: 267,
      comments: 41,
      isLiked: false,
      isSaved: false,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900/95 via-orange-800/90 to-amber-900/95">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Stories Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="mb-6"
        >
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Your Story / Create Post Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <button
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                <FaPlus className="w-8 h-8 text-white" />
              </button>
              <span className="text-xs text-white font-medium truncate max-w-[80px]">
                Your Story
              </span>
            </motion.div>

            {/* Other Stories */}
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div 
                  className={`w-20 h-20 rounded-full p-1 ${
                    story.viewed 
                      ? 'bg-gray-300' 
                      : 'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500'
                  } cursor-pointer transform hover:scale-105 transition-transform duration-200`}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                      {story.avatar ? (
                        <img src={story.avatar} alt={story.author} className="w-full h-full object-cover" />
                      ) : (
                        <GiBee className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-white font-medium truncate max-w-[80px]">
                  {story.author}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-2xl shadow-md border border-amber-100/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <GiBee className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{post.author.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{post.author.role}</span><span>•</span><span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FaEllipsisH className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full aspect-square bg-gradient-to-br from-amber-50 to-orange-50">
                <img src={post.image} alt="Blog post" className="w-full h-full object-cover" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleLike(post.id)} className="flex items-center gap-1 group">
                      {post.isLiked ? <FaHeart className="w-6 h-6 text-red-500" /> : <FaRegHeart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />}
                    </motion.button>
                    <button className="text-gray-700 hover:text-gray-900 transition-colors"><FaComment className="w-6 h-6" /></button>
                    <button className="text-gray-700 hover:text-gray-900 transition-colors"><FaShare className="w-6 h-6" /></button>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSave(post.id)} className="text-gray-700 hover:text-gray-900 transition-colors">
                    {post.isSaved ? <FaBookmark className="w-6 h-6 text-amber-600" /> : <FaRegBookmark className="w-6 h-6" />}
                  </motion.button>
                </div>

                <p className="font-bold text-sm text-gray-900 mb-2">{post.likes.toLocaleString()} likes</p>
                <div className="text-sm text-gray-900">
                  <span className="font-bold">{post.author.name}</span> <span className="whitespace-pre-line">{post.caption}</span>
                </div>
                {post.comments > 0 && (
                  <button className="text-sm text-gray-500 hover:text-gray-700 mt-2 transition-colors">
                    View all {post.comments} comments
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-8">
          <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            Load More Posts
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Blogs;
