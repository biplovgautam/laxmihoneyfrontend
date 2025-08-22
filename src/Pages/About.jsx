import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <>
      {/* About Hero Section */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 text-white min-h-screen flex items-center relative overflow-hidden">
        {/* Background glassmorphism elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-2000"></div>
        
        <div className="container pt-20 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold drop-shadow-lg"
            >
              About Laxmi Honey Industry
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl leading-relaxed text-white/90 max-w-3xl mx-auto"
            >
              From the pristine valleys of Nepal to your table, we bring you the purest honey 
              harvested with love and traditional wisdom passed down through generations.
            </motion.p>
            
            {/* Decorative lines */}
            <motion.div 
              className="flex items-center justify-center gap-4 mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
              <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600/5 via-orange-500/5 to-amber-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Our Story
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Nestled in the heart of Nepal's countryside, our family has been dedicated to 
                sustainable beekeeping for over three generations. What started as a small 
                village initiative has grown into a trusted source of pure, organic honey.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                We work closely with local bee farmers, ensuring fair trade practices while 
                maintaining the highest quality standards. Every jar of our honey tells a 
                story of tradition, purity, and the natural sweetness of Nepal.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-honey rounded-3xl p-8 border border-white/30 shadow-xl backdrop-blur-lg"
            >
              <h3 className="text-2xl font-bold text-[#bc7b13] mb-6">Why Choose Us?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#f37623] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">100% Pure & Natural honey with no additives</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#f37623] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Sustainable & Ethical beekeeping practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#f37623] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Direct from Himalayan foothills</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#f37623] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">Rich in antioxidants & natural enzymes</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;