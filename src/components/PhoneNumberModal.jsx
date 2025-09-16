import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { LottieLoader } from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const PhoneNumberModal = ({ isOpen, onClose }) => {
  const { updatePhoneNumber } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updatePhoneNumber(phoneNumber);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    if (error) setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="glass-honey rounded-3xl p-8 max-w-md w-full border border-white/30 backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#bc7b13] mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600">
                  Please provide your phone number to complete your account setup
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl">
                      🇳🇵 +977
                    </span>
                    <input
                      className="flex-1 p-3 rounded-r-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02]"
                      type="tel"
                      placeholder="9800000000"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      maxLength="10"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 hover:scale-[1.02] duration-300"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !phoneNumber}
                    className="flex-1 bg-[#f37623] text-white py-3 rounded-xl font-semibold hover:bg-[#e06519] hover:scale-[1.02] duration-300 glass-accent disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <LottieLoader size="small" text="" showText={false} className="mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaCheck className="mr-2" />
                        Complete
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhoneNumberModal;
