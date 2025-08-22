import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Products from "../components/Products/Products";

const Product = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-2000"></div>
      
      {/* Hero Section */}
      <motion.section 
        className="pt-32 pb-16 px-4 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our{" "}
            <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Premium Products
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover our collection of pure, natural honey products crafted with love and dedication to quality.
          </motion.p>
          
          {/* Decorative lines */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
            <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Content Section */}
      <motion.section 
        className="relative z-10 bg-gradient-to-b from-transparent to-amber-50/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Glass morphism container for products */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
            <Products/>
          </div>
        </div>
      </motion.section>
      
      {/* Bottom decorative glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-amber-300/20 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default Product;