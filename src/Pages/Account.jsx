import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaShoppingBag, FaCog, FaSignOutAlt, FaEdit, FaSpinner, FaStar, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Mock order data - In real app, this would come from API
  const [orders, setOrders] = useState([
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
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Shipped',
      total: 3200,
      items: [
        { name: 'Honey Gift Set', quantity: 1, price: 3200 }
      ]
    }
  ]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    setEditMode(!editMode);
    // In real app, save to Firebase here
    if (editMode) {
      console.log('Profile updated:', userProfile);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Processing': return 'text-yellow-600 bg-yellow-100';
      case 'Shipped': return 'text-blue-600 bg-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'orders', label: 'Order History', icon: FaShoppingBag },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const ProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-[#f37623] to-[#bc7b13] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#bc7b13]">
                {user?.displayName || 'Welcome'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              {isAdmin && (
                <span className="inline-block bg-gradient-to-r from-[#f37623] to-[#bc7b13] text-white px-3 py-1 rounded-full text-xs font-medium mt-1">
                  Admin
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleProfileUpdate}
            className="flex items-center space-x-2 bg-[#f37623] text-white px-4 py-2 rounded-xl hover:bg-[#bc7b13] transition-colors duration-300"
          >
            <FaEdit />
            <span>{editMode ? 'Save' : 'Edit'}</span>
          </button>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={userProfile.displayName}
              onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
              disabled={!editMode}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={userProfile.phoneNumber}
              onChange={(e) => setUserProfile({...userProfile, phoneNumber: e.target.value})}
              disabled={!editMode}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={userProfile.city}
              onChange={(e) => setUserProfile({...userProfile, city: e.target.value})}
              disabled={!editMode}
              placeholder="Enter your city"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors disabled:bg-gray-50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={userProfile.address}
              onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
              disabled={!editMode}
              placeholder="Enter your full address"
              rows="3"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg text-center">
          <div className="text-2xl font-bold text-[#f37623]">{orders.length}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg text-center">
          <div className="text-2xl font-bold text-[#f37623]">
            Rs. {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
          </div>
          <div className="text-gray-600">Total Spent</div>
        </div>
        <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg text-center">
          <div className="text-2xl font-bold text-[#f37623]">
            {orders.filter(order => order.status === 'Delivered').length}
          </div>
          <div className="text-gray-600">Completed Orders</div>
        </div>
      </div>
    </motion.div>
  );

  const OrdersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg">
        <h3 className="text-xl font-bold text-[#bc7b13] mb-6">Order History</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingBag className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-bold text-[#bc7b13] mt-1">
                      Rs. {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>Rs. {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <button className="flex items-center space-x-2 text-[#f37623] hover:underline text-sm">
                    <FaEye />
                    <span>View Details</span>
                  </button>
                  {order.status === 'Delivered' && (
                    <button className="flex items-center space-x-2 text-[#f37623] hover:underline text-sm">
                      <FaStar />
                      <span>Rate Products</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const SettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg">
        <h3 className="text-xl font-bold text-[#bc7b13] mb-6">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates about your orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f37623]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37623]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Get SMS updates for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f37623]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37623]"></div>
            </label>
          </div>

          {isAdmin && (
            <div className="p-4 border border-[#f37623] rounded-xl bg-gradient-to-r from-[#f37623]/10 to-[#bc7b13]/10">
              <h4 className="font-medium text-[#bc7b13]">Admin Access</h4>
              <p className="text-sm text-gray-600 mb-3">Access the admin dashboard</p>
              <button
                onClick={() => navigate('/admin')}
                className="bg-[#f37623] text-white px-4 py-2 rounded-xl hover:bg-[#bc7b13] transition-colors duration-300"
              >
                Go to Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3c23d]/10 to-[#bc7b13]/10 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#bc7b13] to-[#f3c23d] bg-clip-text text-transparent">
              My Account
            </h1>
            <p className="text-gray-600 mt-1">Manage your profile and orders</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="glass-honey rounded-2xl p-4 border border-white/30 backdrop-blur-lg">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[#f37623] text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-12 lg:col-span-9"
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;