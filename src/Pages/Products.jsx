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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Premium{" "}
            <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Honey Products
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover our collection of pure, natural honey products crafted with love and dedication to quality.
          </motion.p>
        </div>
      </motion.section>

      {/* Products Content */}
      <motion.section 
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Products/>
      </motion.section>
    </div>
  );
};

export default Product;