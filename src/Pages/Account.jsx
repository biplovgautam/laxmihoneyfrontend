import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaShoppingBag, 
  FaCog, 
  FaEdit, 
  FaSpinner, 
  FaStar, 
  FaEye,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaUserCircle,
  FaCity,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdAlternateEmail, MdPhone, MdLocationCity } from 'react-icons/md';
import { HiSparkles, HiLocationMarker } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const Account = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    secondaryPhone: '',
    city: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // City options for Nepal
  const cityOptions = [
    { value: '', label: 'Select City' },
    { value: 'kathmandu', label: 'Kathmandu' },
    { value: 'butwal', label: 'Butwal' },
    { value: 'bhairahawa', label: 'Bhairahawa' },
    { value: 'other', label: 'Other' }
  ];

  // Mock orders data
  const [orders] = useState([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 2500,
      items: [
        { name: 'Pure Wild Honey', quantity: 2, price: 1200 },
        { name: 'Organic Honey', quantity: 1, price: 800 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Processing',
      total: 1800,
      items: [
        { name: 'Himalayan Honey', quantity: 1, price: 1800 }
      ]
    }
  ]);

  // Update userProfile when user data changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        secondaryPhone: user.secondaryPhone || '',
        city: user.city || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userProfile.displayName.trim()) {
      errors.displayName = 'Full name is required';
    }
    
    if (!userProfile.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(userProfile.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (userProfile.secondaryPhone && !validatePhone(userProfile.secondaryPhone)) {
      errors.secondaryPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!userProfile.city) {
      errors.city = 'Please select a city';
    }

    if (!userProfile.address.trim()) {
      errors.address = 'Address is required';
    } else if (userProfile.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (minimum 10 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setToast({ show: true, message: 'Please fix the errors below', type: 'error' });
      return;
    }

    setSaveLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: userProfile.displayName,
        phoneNumber: userProfile.phoneNumber,
        secondaryPhone: userProfile.secondaryPhone,
        city: userProfile.city,
        address: userProfile.address,
        lastUpdated: new Date()
      });

      setSaveSuccess(true);
      setEditMode(false);
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ show: true, message: 'Failed to update profile. Please try again.', type: 'error' });
    }
    setSaveLoading(false);
  };

  const handleCancel = () => {
    setUserProfile({
      displayName: user.displayName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      secondaryPhone: user.secondaryPhone || '',
      city: user.city || '',
      address: user.address || ''
    });
    setFormErrors({});
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setToast({ show: true, message: 'Failed to logout. Please try again.', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-amber-600 bg-amber-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isProfileIncomplete = () => {
    return !user?.phoneNumber || !user?.address || !user?.city;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <FaUserCircle className="text-6xl text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your account</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <Navbar />
      
      {/* Add navbar height gap */}
      <div className="h-16 lg:h-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Completion Alert */}
        {isProfileIncomplete() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/95 backdrop-blur-sm border border-amber-200 rounded-2xl shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <FaExclamationTriangle className="text-amber-600 text-xl sm:text-2xl" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg">Complete Your Profile</h3>
                <p className="text-gray-600 text-sm sm:text-base">Add missing information to enjoy all features</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
              <div className="relative mx-auto sm:mx-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white/50"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl ring-4 ring-white/50">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <HiSparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  Welcome, {user.displayName || user.email?.split('@')[0]}
                </h1>
                <p className="text-white/90 drop-shadow-md text-sm sm:text-base">Manage your account and orders</p>
                {isAdmin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mt-2">
                    <HiSparkles className="w-4 h-4 mr-1" />
                    Administrator
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/30">
            <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'orders', label: 'Orders', icon: FaShoppingBag },
                { id: 'settings', label: 'Settings', icon: FaCog }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                    activeTab === id
                      ? 'border-white text-white'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Profile Information</h2>
                  {/* Desktop Edit Button - only show on larger screens when not in edit mode */}
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="hidden sm:flex items-center justify-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm sm:text-base"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-3"
                  >
                    <FaCheck className="text-green-600" />
                    <span className="text-green-800">Profile updated successfully!</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={userProfile.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className={`w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          formErrors.displayName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 text-sm sm:text-base">
                        {userProfile.displayName || 'Not provided'}
                      </div>
                    )}
                    {formErrors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 flex items-center justify-between text-sm sm:text-base">
                      <span>{userProfile.email}</span>
                      <FaShieldAlt className="text-gray-400" title="Email cannot be changed" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={userProfile.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="9801234567"
                        maxLength="10"
                      />
                    ) : (
                      <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 text-sm sm:text-base">
                        {userProfile.phoneNumber || 'Not provided'}
                      </div>
                    )}
                    {formErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Secondary Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MdPhone className="inline w-4 h-4 mr-2" />
                      Secondary Phone (Optional)
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={userProfile.secondaryPhone}
                        onChange={(e) => handleInputChange('secondaryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          formErrors.secondaryPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="9801234567 (Backup number)"
                        maxLength="10"
                      />
                    ) : (
                      <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 text-sm sm:text-base">
                        {userProfile.secondaryPhone || 'Not provided'}
                      </div>
                    )}
                    {formErrors.secondaryPhone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.secondaryPhone}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCity className="inline w-4 h-4 mr-2" />
                      City
                    </label>
                    {editMode ? (
                      <select
                        value={userProfile.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          formErrors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {cityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 text-sm sm:text-base">
                        {cityOptions.find(opt => opt.value === userProfile.city)?.label || 'Not selected'}
                      </div>
                    )}
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline w-4 h-4 mr-2" />
                      Complete Address
                    </label>
                    {editMode ? (
                      <textarea
                        value={userProfile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows="3"
                        className={`w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base ${
                          formErrors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your complete address including street, city, and postal code"
                      />
                    ) : (
                      <div className="px-4 py-3 sm:py-4 bg-gray-50 rounded-lg text-gray-800 min-h-[80px] text-sm sm:text-base">
                        {userProfile.address || 'Not provided'}
                      </div>
                    )}
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons - show at bottom on mobile/tablet */}
                <div className="mt-6 sm:hidden">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {saveLoading ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaSave className="w-4 h-4" />
                        )}
                        <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                      <FaCalendarAlt className="text-amber-500" />
                      <span>Member since: {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                      <FaShieldAlt className="text-green-500" />
                      <span>Account Status: Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <FaShoppingBag className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">Start shopping to see your orders here</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg text-sm sm:text-base"
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="mb-4 sm:mb-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800">Order #{order.id}</h3>
                            <p className="text-gray-600 text-sm">{formatDate(order.date)}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)} text-center`}>
                              {order.status}
                            </span>
                            <span className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-right">NPR {order.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-gray-700 text-sm sm:text-base">{item.name} x {item.quantity}</span>
                              <span className="font-medium text-sm sm:text-base">NPR {item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-center sm:justify-end mt-4">
                          <button className="flex items-center space-x-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm sm:text-base">
                            <FaEye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Account Security</h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      Keep your account secure by managing your login credentials.
                    </p>
                    <button
                      className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                      disabled
                    >
                      Change Password (Coming Soon)
                    </button>
                  </div>

                  <div className="border border-red-200 rounded-xl p-4 sm:p-6 bg-red-50">
                    <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                    <p className="text-red-600 mb-4 text-sm sm:text-base">
                      Permanently delete your account and all associated data.
                    </p>
                    <button
                      className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm sm:text-base"
                      disabled
                    >
                      Delete Account (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Account;
