import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  EyeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { LottieLoader } from '../LoadingSpinner';
import Toast from '../Toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderStatuses = [
    { id: 'new', title: 'New Orders', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 'processing', title: 'Processing', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { id: 'packaging', title: 'Packaging', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { id: 'shipped', title: 'Shipped', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { id: 'delivered', title: 'Delivered', color: 'bg-green-100 border-green-300 text-green-800' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      showToast('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error updating order status', 'error');
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateTotal = (items) => {
    return items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader size="medium" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Management</h2>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      {/* Order Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {orderStatuses.map((status) => (
          <div key={status.id} className="bg-gray-50 rounded-lg p-4">
            <div className={`text-center p-2 rounded-lg mb-4 border-2 ${status.color}`}>
              <h3 className="font-semibold">{status.title}</h3>
              <span className="text-sm">({getOrdersByStatus(status.id).length})</span>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {getOrdersByStatus(status.id).map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      #{order.id.slice(-6)}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span className="truncate">{order.customerName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{calculateTotal(order.items)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="text-sm text-gray-500">
                      {order.items?.length || 0} item(s)
                    </div>

                    {/* Status Change Buttons */}
                    <div className="mt-3 pt-2 border-t">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {orderStatuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Order Details #{selectedOrder.id.slice(-6)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>₹{calculateTotal(selectedOrder.items)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Order placed: {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize font-medium">{selectedOrder.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;
