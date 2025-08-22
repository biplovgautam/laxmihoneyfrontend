import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { user, markProfileComplete, skipProfileCompletion } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const checkPhoneUniqueness = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) return true;
    
    try {
      setCheckingPhone(true);
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Check if phone already exists (excluding current user)
      const usersRef = collection(db, 'users');
      const phoneQuery = query(usersRef, where('phoneNumber', '==', cleanPhone));
      const querySnapshot = await getDocs(phoneQuery);
      
      // If phone exists and it's not the current user's phone, it's not unique
      const existingUser = querySnapshot.docs.find(doc => doc.id !== user?.uid);
      return !existingUser;
    } catch (error) {
      console.error('Error checking phone uniqueness:', error);
      return true; // Allow if check fails
    } finally {
      setCheckingPhone(false);
    }
  };

  const handlePhoneChange = async (e) => {
    const phone = e.target.value.replace(/\D/g, '');
    if (phone.length <= 10) {
      setFormData(prev => ({ ...prev, phoneNumber: phone }));
      
      if (phone.length === 10) {
        const isUnique = await checkPhoneUniqueness(phone);
        if (!isUnique) {
          setPhoneError('This phone number is already registered with another account');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address (minimum 10 characters)';
    }
    
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      // Double-check phone uniqueness before submitting
      const isPhoneUnique = await checkPhoneUniqueness(formData.phoneNumber);
      if (!isPhoneUnique) {
        setPhoneError('This phone number is already registered with another account');
        setLoading(false);
        return;
      }
      
      const success = await markProfileComplete({
        phoneNumber: formData.phoneNumber,
        address: formData.address.trim()
      });
      
      if (success) {
        onClose();
      } else {
        setErrors({ submit: 'Failed to update profile. Please try again.' });
      }
      setLoading(false);
    }
  };

  const handleSkip = () => {
    skipProfileCompletion();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-amber-100">
              Complete your profile to enjoy all features and place orders
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="1234567890"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.phoneNumber || phoneError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength="10"
                />
                {checkingPhone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                  </div>
                )}
              </div>
              {(errors.phoneNumber || phoneError) && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber || phoneError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter 10-digit phone number without country code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your complete address including street, city, state, and postal code"
                rows="3"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">This address will be used for delivery</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading || checkingPhone || phoneError}
                className="flex-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg hover:from-amber-700 hover:via-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>

          <div className="bg-amber-50 p-4 border-t">
            <div className="flex items-start space-x-2">
              <div className="text-amber-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Why complete your profile?</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Required to place orders</li>
                  <li>• Faster checkout process</li>
                  <li>• Better customer support</li>
                  <li>• You can skip and complete later (we'll remind you)</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
