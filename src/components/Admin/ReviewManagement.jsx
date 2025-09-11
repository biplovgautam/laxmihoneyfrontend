import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  StarIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Toast from '../Toast';

const ReviewManagement = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(productId || '');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products', 'error');
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', selectedProduct),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Error fetching reviews', 'error');
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: status,
        moderatedAt: new Date()
      });
      showToast(`Review ${status}`, 'success');
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Error updating review', 'error');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      showToast('Review deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Error deleting review', 'error');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarSolid
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Review Management</h2>
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{reviews.length} reviews</span>
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select a product to view reviews</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.title} ({product.reviews || 0} reviews)
            </option>
          ))}
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedProduct ? 'This product has no reviews yet.' : 'Select a product to view reviews.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {review.userName || 'Anonymous'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.userEmail && (
                    <p className="text-sm text-gray-500 mt-2">Email: {review.userEmail}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Approve review"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Reject review"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete review"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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

export default ReviewManagement;
