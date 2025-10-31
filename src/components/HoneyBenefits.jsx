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
      <div className="container-modern relative z-10 py-16 md:py-24">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <GiHoneypot className="w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-bounce-gentle drop-shadow-lg" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
              Nature's Golden Elixir
            </h2>
            <GiBee className="w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-bounce-gentle drop-shadow-lg" />
          </div>
          <p className="text-base md:text-lg text-white/95 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-lg">
            Discover the incredible health benefits of pure honey and the vital role bees play in our ecosystem. 
            Every jar supports sustainable beekeeping and environmental conservation.
          </p>
        </motion.div>

        {/* Health Benefits Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-[2px] w-12 md:w-20 bg-gradient-to-r from-transparent to-white"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl flex items-center gap-2">
              <FaHeart className="w-6 h-6 text-red-400 drop-shadow-lg" />
              Health Benefits
            </h3>
            <div className="h-[2px] w-12 md:w-20 bg-gradient-to-l from-transparent to-white"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {healthBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/30 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {benefit.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider with Honey Jar Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center my-12 md:my-16"
        >
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent max-w-xs"></div>
          <div className="mx-6 p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-xl">
            <GiHoneyJar className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent max-w-xs"></div>
        </motion.div>

        {/* Environment Benefits Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-[2px] w-12 md:w-20 bg-gradient-to-r from-transparent to-white"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl flex items-center gap-2">
              <FaLeaf className="w-6 h-6 text-green-400 drop-shadow-lg" />
              Bees & Environment
            </h3>
            <div className="h-[2px] w-12 md:w-20 bg-gradient-to-l from-transparent to-white"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {environmentBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/30 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {benefit.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>


      </div>

    </section>
  );
};

export default HoneyBenefits;
