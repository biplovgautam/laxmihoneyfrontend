import React from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Enhanced Lottie Loader Component with better UX
const LottieLoader = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  className = "",
  speed = 1,
  loop = true 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${sizeClasses[size]} flex items-center justify-center`}
      >
        <DotLottieReact
          src="https://lottie.host/a27144d9-8955-41a2-86ab-2658d44f79f9/JGmpbFRteg.lottie"
          loop={loop}
          autoplay
          speed={speed}
          className="w-full h-full"
        />
      </motion.div>
      {showText && text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`text-gray-600 font-medium text-center ${textSizeClasses[size]}`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Legacy LoadingSpinner for backward compatibility (deprecated)
const LoadingSpinner = ({ size = 'medium', color = '#f37623', text = 'Loading...' }) => {
  return <LottieLoader size={size} text={text} />;
};

// Enhanced fullscreen loading overlay with Lottie animations
export const LottieOverlay = ({ 
  show, 
  text = 'Loading...', 
  size = 'large',
  backdrop = true,
  className = "" 
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${backdrop ? 'bg-black/50 backdrop-blur-sm' : ''} flex items-center justify-center z-50 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass-honey rounded-2xl p-8 border border-white/30 backdrop-blur-lg shadow-2xl"
      >
        <LottieLoader size={size} text={text} />
      </motion.div>
    </motion.div>
  );
};

// Legacy LoadingOverlay for backward compatibility (deprecated)
export const LoadingOverlay = ({ show, text = 'Loading...' }) => {
  return <LottieOverlay show={show} text={text} />;
};

// Export new components
export { LottieLoader };
export default LoadingSpinner;
