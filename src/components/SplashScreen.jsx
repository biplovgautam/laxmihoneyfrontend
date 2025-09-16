import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { HiSparkles } from 'react-icons/hi';

const SplashScreen = ({ onComplete }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random progress increments
      });
    }, 200);

    // Show splash for exactly 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

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
              <p className="text-white/90 text-lg font-medium mb-3">
                Preparing your honey experience...
              </p>
              
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
