import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaUser, FaPhone, FaMapMarkerAlt, FaCity, FaCheck, FaSpinner } from 'react-icons/fa';
import { MdPhone } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { user, markProfileComplete, skipProfileCompletion } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    secondaryPhone: user?.secondaryPhone || '',
    city: user?.city || '',
    address: user?.address || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // City options for Nepal
  const cityOptions = [
    { value: '', label: 'Select City' },
    { value: 'kathmandu', label: 'Kathmandu' },
    { value: 'butwal', label: 'Butwal' },
    { value: 'bhairahawa', label: 'Bhairahawa' },
    { value: 'other', label: 'Other' }
  ];

  // Determine if this is just for phone number (legacy) or full profile
  const isPhoneOnlyMode = user && !user.phoneNumber && user.address;
  const isFullProfileMode = user && (!user.phoneNumber || !user.address || !user.city || !user.displayName);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        secondaryPhone: user.secondaryPhone || '',
        city: user.city || '',
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

  const handleSecondaryPhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, '');
    if (phone.length <= 10) {
      setFormData(prev => ({ ...prev, secondaryPhone: phone }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate full name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    }
    
    // Validate phone number (always required)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate secondary phone if provided
    if (formData.secondaryPhone && !validatePhone(formData.secondaryPhone)) {
      newErrors.secondaryPhone = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate city
    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }
    
    // Validate address (only if not in phone-only mode)
    if (!isPhoneOnlyMode) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      } else if (formData.address.trim().length < 10) {
        newErrors.address = 'Please enter a complete address (minimum 10 characters)';
      }
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
      
      try {
        // Update profile in Firestore directly for real-time updates
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: formData.displayName.trim(),
          phoneNumber: formData.phoneNumber,
          secondaryPhone: formData.secondaryPhone || '',
          city: formData.city,
          address: formData.address.trim(),
          lastUpdated: new Date()
        });

        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } catch (error) {
        console.error('Error updating profile:', error);
        setErrors({ submit: 'Failed to update profile. Please try again.' });
      }
      setLoading(false);
    }
  };

  const handleSkip = () => {
    skipProfileCompletion();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <HiSparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Complete Your Profile</h2>
                    <p className="text-amber-100 text-lg">
                      Help us serve you better with complete information
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-6 p-4 bg-green-100 border border-green-200 rounded-xl flex items-center space-x-3"
              >
                <FaCheck className="text-green-600 text-xl" />
                <span className="text-green-800 font-medium">{successMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaUser className="inline w-4 h-4 mr-2 text-amber-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                      errors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.displayName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaUser className="inline w-4 h-4 mr-2 text-amber-500" />
                    Email Address
                  </label>
                  <div className="px-4 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600">
                    {user?.email}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaPhone className="inline w-4 h-4 mr-2 text-amber-500" />
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="9801234567"
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                        errors.phoneNumber || phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      maxLength="10"
                    />
                    {checkingPhone && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <FaSpinner className="animate-spin text-amber-500" />
                      </div>
                    )}
                  </div>
                  {(errors.phoneNumber || phoneError) && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.phoneNumber || phoneError}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Enter 10-digit phone number without country code</p>
                </div>

                {/* Secondary Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <MdPhone className="inline w-4 h-4 mr-2 text-amber-500" />
                    Secondary Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryPhone}
                    onChange={handleSecondaryPhoneChange}
                    placeholder="9801234567 (Backup)"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                      errors.secondaryPhone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    maxLength="10"
                  />
                  {errors.secondaryPhone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.secondaryPhone}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Optional backup contact number</p>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaCity className="inline w-4 h-4 mr-2 text-amber-500" />
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 ${
                      errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="inline w-4 h-4 mr-2 text-amber-500" />
                    Complete Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address including street, city, and postal code"
                    rows="4"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 resize-none ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.address}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">This address will be used for delivery purposes</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading || checkingPhone || phoneError}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Complete Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="bg-amber-50 p-6 border-t border-amber-100">
              <div className="flex items-start space-x-3">
                <div className="text-amber-600 mt-1">
                  <HiSparkles className="w-5 h-5" />
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">Why complete your profile?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Required to place orders and receive deliveries</li>
                    <li>• Faster checkout process for future orders</li>
                    <li>• Better customer support with accurate contact information</li>
                    <li>• Secure account with backup contact options</li>
                    <li>• You can always update this information later in your account settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
