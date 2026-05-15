import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaLock, FaTimes } from 'react-icons/fa';

// Reusable prompt for unauthenticated users trying to perform a gated action.
// Pass action ("like this post", "comment", etc.) to customize copy.
const LoginPromptModal = ({ isOpen, onClose, action = 'continue' }) => {
  const location = useLocation();
  const redirect = location.pathname + location.search;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white relative">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Sign in required</h3>
                  <p className="text-amber-100 text-sm">Quick and free</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-gray-700">
                Please sign in to {action}. It only takes a moment.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow"
                >
                  Sign In
                </Link>
                <Link
                  to={`/signup?redirect=${encodeURIComponent(redirect)}`}
                  className="w-full text-center py-3 rounded-xl border-2 border-amber-200 hover:bg-amber-50 text-amber-700 font-semibold"
                >
                  Create an Account
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;
