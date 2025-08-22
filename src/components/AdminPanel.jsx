import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaShoppingCart, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    products: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Simulate loading stats
    setStats({
      totalUsers: 156,
      totalOrders: 89,
      revenue: 125000,
      products: 12
    });
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'orders', label: 'Orders', icon: FaShoppingCart },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-[#bc7b13] mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </motion.div>
  );

  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FaShoppingCart}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue (NPR)"
          value={`Rs. ${stats.revenue.toLocaleString()}`}
          icon={FaChartBar}
          color="bg-[#f37623]"
        />
        <StatCard
          title="Products"
          value={stats.products}
          icon={FaCog}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
      >
        <h3 className="text-xl font-bold text-[#bc7b13] mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New user registered', time: '2 minutes ago', user: 'john@example.com' },
            { action: 'Order placed', time: '15 minutes ago', user: 'jane@example.com' },
            { action: 'Product updated', time: '1 hour ago', user: 'admin' },
            { action: 'New review posted', time: '2 hours ago', user: 'mike@example.com' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const UsersContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-[#bc7b13] mb-4">User Management</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'John Doe', email: 'john@example.com', phone: '+977-9800000001', status: 'Active' },
              { name: 'Jane Smith', email: 'jane@example.com', phone: '+977-9800000002', status: 'Active' },
              { name: 'Mike Johnson', email: 'mike@example.com', phone: '+977-9800000003', status: 'Inactive' },
            ].map((user, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">{user.name}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.phone}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-[#f37623] hover:underline text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const OrdersContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-[#bc7b13] mb-4">Order Management</h3>
      <div className="space-y-4">
        {[
          { id: '#001', customer: 'John Doe', amount: 'Rs. 2,500', status: 'Pending', date: '2024-01-15' },
          { id: '#002', customer: 'Jane Smith', amount: 'Rs. 1,800', status: 'Completed', date: '2024-01-14' },
          { id: '#003', customer: 'Mike Johnson', amount: 'Rs. 3,200', status: 'Processing', date: '2024-01-13' },
        ].map((order, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span className="font-medium">{order.id}</span>
                <span className="text-gray-600">{order.customer}</span>
                <span className="font-bold text-[#bc7b13]">{order.amount}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{order.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs ${
                order.status === 'Completed' 
                  ? 'bg-green-100 text-green-800' 
                  : order.status === 'Processing'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
              <button className="text-[#f37623] hover:underline text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const SettingsContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-[#bc7b13] mb-4">Settings</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">General Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">Enable email notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Enable SMS notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">Auto-approve reviews</span>
            </label>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Admin Users</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">madhavbiplov@gmail.com</p>
            <p className="text-sm text-gray-600">igpragyabhusal@gmail.com</p>
            <p className="text-sm text-gray-600">laxmihoneyindustry@gmail.com</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3c23d]/10 to-[#bc7b13]/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 glass-honey rounded-2xl p-6 border border-white/30 backdrop-blur-lg"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#bc7b13] to-[#f3c23d] bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.displayName || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-300"
          >
            <FaSignOutAlt />
            Logout
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
                        ? 'bg-[#f37623] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/20'
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
            {activeTab === 'dashboard' && <DashboardContent />}
            {activeTab === 'users' && <UsersContent />}
            {activeTab === 'orders' && <OrdersContent />}
            {activeTab === 'settings' && <SettingsContent />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
