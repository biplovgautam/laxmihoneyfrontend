import React from 'react';
import { motion } from 'framer-motion';
import { GiHoneypot } from 'react-icons/gi';
import BlogsComponent from "../components/Blogs/Blogs";
import galleryImage from '../assets/gallery/SAM_1386.JPG';

const Blogs = () => {
  return (
    <div className="min-h-screen bg-[#fffef8]">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={galleryImage} 
            alt="Laxmi Honey Blog" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-800/85 to-amber-900/80"></div>
        </div>
        
        <div className="container-modern pt-32 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-6">
              <GiHoneypot className="w-4 h-4" />
              <span>Blog & Stories</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Honey Stories & Insights
            </h1>
            
            <p className="text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-lg">
              Discover the world of pure honey, bee farming, and natural wellness through our articles and stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blogs Content Section */}
      <section className="py-16 md:py-20">
        <div className="container-modern">
          <BlogsComponent />
        </div>
      </section>
    </div>
  );
};

export default Blogs;