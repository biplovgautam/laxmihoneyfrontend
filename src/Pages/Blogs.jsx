import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiHoneypot, GiBee } from 'react-icons/gi';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark, FaEllipsisH } from 'react-icons/fa';
import Blog1 from "../assets/Blogs/1.jpg";
import Blog2 from "../assets/Blogs/2.jpg";
import Blog3 from "../assets/Blogs/3.jpg";
import Blog4 from "../assets/Blogs/4.jpg";
import galleryImage from '../assets/gallery/SAM_1386.JPG';

const Blogs = () => {
  // Sample blog posts data
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Laxmi Dhakal",
        role: "CEO & Founder",
        avatar: null, // Placeholder
      },
      timestamp: "2 hours ago",
      caption: "The Sweet Journey of Pure Honey Production 🍯\n\nDiscover how our dedicated beekeepers work with nature to create the purest, most delicious honey while maintaining sustainable practices. Every drop of honey tells a story of hard work, dedication, and love for nature.",
      image: Blog1,
      likes: 234,
      comments: 45,
      shares: 12,
      isLiked: false,
      isSaved: false,
    },
    {
      id: 2,
      author: {
        name: "Biplov Gautam",
        role: "CTO & MD",
        avatar: null,
      },
      timestamp: "5 hours ago",
      caption: "Health Benefits of Raw Unprocessed Honey 💚\n\nLearn about the incredible health benefits of consuming raw honey and how it can boost your immune system and overall wellness. Nature's perfect medicine!",
      image: Blog2,
      likes: 189,
      comments: 32,
      shares: 8,
      isLiked: false,
      isSaved: false,
    },
    {
      id: 3,
      author: {
        name: "Bipin Gautam",
        role: "Operations Manager",
        avatar: null,
      },
      timestamp: "1 day ago",
      caption: "Sustainable Beekeeping: Our Commitment to Nature 🌿\n\nExplore our eco-friendly beekeeping methods that support bee populations while producing premium quality honey products. Together we protect our bees!",
      image: Blog3,
      likes: 312,
      comments: 56,
      shares: 23,
      isLiked: true,
      isSaved: true,
    },
    {
      id: 4,
      author: {
        name: "Om Prakash Gautam",
        role: "Production Manager",
        avatar: null,
      },
      timestamp: "2 days ago",
      caption: "From Hive to Table: Our Quality Assurance Process ✓\n\nTake a behind-the-scenes look at our rigorous quality control process that ensures every jar meets our premium standards. Quality is our promise!",
      image: Blog4,
      likes: 267,
      comments: 41,
      shares: 15,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Compact */}
      <section className="relative h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={galleryImage} 
            alt="Laxmi Honey Blog" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-orange-800/90 to-amber-900/85"></div>
        </div>
        
        <div className="container-modern pt-24 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-4">
              <GiHoneypot className="w-4 h-4" />
              <span>Community Feed</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
              Honey Stories & Updates
            </h1>
            
            <p className="text-base md:text-lg text-white/95 leading-relaxed drop-shadow-lg">
              Follow our journey and stay updated with the latest from our beekeeping community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <GiBee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{post.author.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.author.role}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FaEllipsisH className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Image */}
                <div className="w-full aspect-square bg-gray-100">
                  <img 
                    src={post.image} 
                    alt="Blog post"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 group"
                      >
                        {post.isLiked ? (
                          <FaHeart className="w-6 h-6 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                        )}
                      </motion.button>
                      <button className="text-gray-700 hover:text-gray-900 transition-colors">
                        <FaComment className="w-6 h-6" />
                      </button>
                      <button className="text-gray-700 hover:text-gray-900 transition-colors">
                        <FaShare className="w-6 h-6" />
                      </button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSave(post.id)}
                      className="text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {post.isSaved ? (
                        <FaBookmark className="w-6 h-6 text-amber-600" />
                      ) : (
                        <FaRegBookmark className="w-6 h-6" />
                      )}
                    </motion.button>
                  </div>

                  {/* Likes Count */}
                  <p className="font-bold text-sm text-gray-900 mb-2">
                    {post.likes.toLocaleString()} likes
                  </p>

                  {/* Caption */}
                  <div className="text-sm text-gray-900">
                    <span className="font-bold">{post.author.name}</span>{' '}
                    <span className="whitespace-pre-line">{post.caption}</span>
                  </div>

                  {/* View Comments */}
                  {post.comments > 0 && (
                    <button className="text-sm text-gray-500 hover:text-gray-700 mt-2 transition-colors">
                      View all {post.comments} comments
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Load More Posts
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blogs;