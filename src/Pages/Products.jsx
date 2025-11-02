import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Products from "../components/Products/Products";
import honeyback from "../assets/honeyback.jpg";

const Product = () => {
  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${honeyback})`,
          zIndex: 0
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-orange-800/80 to-amber-900/85"></div>
      </div>
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section 
          className="pt-32 pb-16 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Premium{" "}
              <span className="bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Products/>
        </motion.section>
      </div>
    </div>
  );
};

export default Product;