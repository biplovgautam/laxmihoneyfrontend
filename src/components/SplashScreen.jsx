import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { HiSparkles } from 'react-icons/hi';
import dataPreloader from '../services/dataPreloader';

const SplashScreen = ({ onComplete }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [dataPreloaded, setDataPreloaded] = useState(false);

  useEffect(() => {
    let progressInterval;
    let textUpdateInterval;
    
    const loadingTexts = [
      'Initializing...',
      'Loading honey products...',
      'Fetching featured items...',
      'Optimizing your experience...',
      'Almost ready...'
    ];

    // Start data preloading immediately
    const preloadData = async () => {
      try {
        await dataPreloader.preloadEssentialData();
        setDataPreloaded(true);
        setLoadingText('Data loaded successfully!');
      } catch (error) {
        console.error('Preloading failed:', error);
        setDataPreloaded(true); // Continue anyway
        setLoadingText('Ready to explore!');
      }
    };

    preloadData();

    // Update loading text periodically
    let textIndex = 0;
    textUpdateInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 600);

    // Simulate realistic progress
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        
        // Faster progress if data is already loaded
        const increment = dataPreloaded ? 20 : Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    // Ensure minimum 3-second display
    const minDisplayTime = 3000;
    const timer = setTimeout(() => {
      // Only complete if data is loaded and progress is 100%
      if (dataPreloaded && progress >= 95) {
        setShowSplash(false);
        setTimeout(onComplete, 500); // Wait for exit animation
      } else {
        // Wait a bit more if needed
        const extraWait = setTimeout(() => {
          setShowSplash(false);
          setTimeout(onComplete, 500);
        }, 1000);
        
        return () => clearTimeout(extraWait);
      }
    }, minDisplayTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      clearInterval(textUpdateInterval);
    };
  }, [onComplete, dataPreloaded, progress]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center z-50"
        >
          {/* Background honey pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full blur-xl"></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-orange-300 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-amber-300 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-yellow-400 rounded-full blur-lg"></div>
          </div>

          <div className="text-center relative z-10">
            {/* Logo/Brand area */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative mb-6">
                <HiSparkles className="absolute -top-2 -right-2 text-yellow-300 text-2xl animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                  Laxmi <span className="text-yellow-200">Honey</span>
                </h1>
                <HiSparkles className="absolute -bottom-2 -left-2 text-yellow-300 text-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <p className="text-white/90 text-lg md:text-xl font-medium">
                Pure • Natural • Premium
              </p>
            </motion.div>

            {/* Lottie Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="w-32 h-32 mx-auto mb-8"
            >
              <DotLottieReact
                src="https://lottie.host/a27144d9-8955-41a2-86ab-2658d44f79f9/JGmpbFRteg.lottie"
                loop
                autoplay
                speed={1.2}
                className="w-full h-full"
              />
            </motion.div>

            {/* Loading text with animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-6"
            >
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white/90 text-lg font-medium mb-3"
              >
                {loadingText}
              </motion.p>
              
              {/* Progress bar */}
              <div className="w-64 mx-auto bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-white/70 text-sm mt-3"
              >
                {Math.round(Math.min(progress, 100))}% Complete
              </motion.p>
              
              {/* Loading status indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex items-center justify-center mt-3 space-x-2"
              >
                <div className={`w-2 h-2 rounded-full ${dataPreloaded ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                <span className="text-white/60 text-xs">
                  {dataPreloaded ? 'Data Ready' : 'Loading Data'}
                </span>
              </motion.div>
            </motion.div>

            {/* Floating honey drops */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-3 bg-yellow-300 rounded-full opacity-70"
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    scale: 0 
                  }}
                  animate={{ 
                    y: window.innerHeight + 20,
                    scale: [0, 1, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
