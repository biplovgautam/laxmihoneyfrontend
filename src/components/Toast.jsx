import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfo } from 'react-icons/fa';

const Toast = ({ type = 'success', message, show, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: FaCheck,
          bgColor: 'bg-green-500',
          borderColor: 'border-green-400',
          textColor: 'text-green-50'
        };
      case 'error':
        return {
          icon: FaTimes,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400',
          textColor: 'text-red-50'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-50'
        };
      case 'info':
        return {
          icon: FaInfo,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-50'
        };
      default:
        return {
          icon: FaInfo,
          bgColor: 'bg-gray-500',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-50'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.3 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.borderColor} ${config.textColor} px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-lg max-w-md`}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <Icon className="text-lg" />
            </motion.div>
            <div className="flex-1">
              <p className="font-medium text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, duration = 4000) => {
    const id = Date.now();
    const newToast = { id, type, message, duration, show: true };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 500); // Extra time for exit animation
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          show={toast.show}
          duration={0} // Managed by the hook
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    hideToast,
    ToastContainer
  };
};

export default Toast;
