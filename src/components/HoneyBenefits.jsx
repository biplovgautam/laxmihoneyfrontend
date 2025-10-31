import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaHeart, FaShieldAlt, FaBrain, FaStar, FaCheckCircle } from 'react-icons/fa';
import { GiHoneypot, GiHoneyJar, GiBee } from 'react-icons/gi';
import { MdEco, MdHealthAndSafety } from 'react-icons/md';

// Import all bee videos
import bee1 from '../assets/videos/bee1.mp4';
import bee2 from '../assets/videos/bee2.mp4';
import bee3 from '../assets/videos/bee3.mp4';
import bee4 from '../assets/videos/bee4.mp4';

const videos = [bee1, bee2, bee3, bee4];

const HoneyBenefits = () => {
  const [randomVideo, setRandomVideo] = useState('');

  useEffect(() => {
    // Select a random video on component mount
    const randomIndex = Math.floor(Math.random() * videos.length);
    setRandomVideo(videos[randomIndex]);
  }, []);

  const healthBenefits = [
    {
      icon: <FaHeart className="w-6 h-6" />,
      title: "Heart Health",
      description: "Rich in antioxidants that help reduce heart disease risk and lower blood pressure naturally."
    },
    {
      icon: <FaBrain className="w-6 h-6" />,
      title: "Boosts Energy",
      description: "Natural sugars provide instant energy boost, perfect for athletes and active lifestyles."
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Immunity Booster",
      description: "Antibacterial and antiviral properties strengthen your immune system naturally."
    },
    {
      icon: <MdHealthAndSafety className="w-6 h-6" />,
      title: "Digestive Health",
      description: "Soothes digestive issues and promotes healthy gut bacteria for better digestion."
    }
  ];

  const environmentBenefits = [
    {
      icon: <MdEco className="w-6 h-6" />,
      title: "Ecosystem Balance",
      description: "Bees maintain ecological balance through pollination of wild plants and flowers."
    },
    {
      icon: <GiBee className="w-6 h-6" />,
      title: "Food Production",
      description: "Responsible for pollinating 70% of crops that feed 90% of the world's population."
    },
    {
      icon: <FaLeaf className="w-6 h-6" />,
      title: "Biodiversity",
      description: "Essential pollinators that help maintain plant diversity and forest regeneration."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {randomVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={randomVideo} type="video/mp4" />
          </video>
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="container-modern relative z-10 py-20 md:py-32">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl mb-6">
            The Power of Pure Honey
          </h2>
          <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-lg">
            Nature's perfect food - packed with nutrients, energy, and healing properties that have sustained humanity for thousands of years.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Health Benefits */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl mb-3 flex items-center gap-3">
                <GiHoneypot className="w-7 h-7 text-amber-400" />
                Health Benefits
              </h3>
              <div className="h-[2px] w-20 bg-amber-400"></div>
            </div>

            <div className="space-y-6">
              {healthBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Environmental Impact */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl mb-3 flex items-center gap-3">
                <GiBee className="w-7 h-7 text-amber-400" />
                Environmental Impact
              </h3>
              <div className="h-[2px] w-20 bg-green-400"></div>
            </div>

            <div className="space-y-6">
              {environmentBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <FaCheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium text-sm md:text-base">Every jar supports sustainable beekeeping & environmental conservation</span>
          </div>
        </motion.div>

      </div>

    </section>
  );
};

export default HoneyBenefits;
