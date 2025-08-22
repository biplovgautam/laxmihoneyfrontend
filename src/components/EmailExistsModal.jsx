import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EmailExistsModal = ({ isOpen, onClose, email }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-amber-400 text-2xl" />
            <h2 className="text-2xl font-bold text-white">Account Exists</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-white/80">
            An account with email <strong className="text-amber-300">{email}</strong> already exists.
          </p>
          <p className="text-white/70">
            Would you like to sign in instead, or use a different email address?
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/login"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-colors text-center font-medium"
          >
            Sign In Instead
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            Use Different Email
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailExistsModal;
