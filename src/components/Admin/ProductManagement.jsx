import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  setDoc,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary, getOptimizedImageUrl } from '../../config/cloudinary';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { LottieLoader } from '../LoadingSpinner';
import Toast from '../Toast';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'deleted'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: '',
    badges: [],
    images: [],
    stock: '',
    sku: '',
    weight: '',
    nutritionalInfo: '',
    origin: '',
    isActive: true,
    isFeatured: false,
    tags: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    'Pure Honey',
    'Raw Honey',
    'Flavoured Honey',
    'Mad Honey',
    'Gift Sets',
    'Honey Bee Products',
    'Seasonal',
    'Other'
  ];

  const badgeOptions = [
    'Best Seller',
    'New',
    'Organic',
    'Limited Edition',
    'Premium',
    'Natural'
  ];

  useEffect(() => {
    fetchProducts();
  }, [viewMode]); // Refetch when viewMode changes

  const fetchProducts = async () => {
    try {
      const collectionName = viewMode === 'active' ? 'products' : 'del_products';
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async () => {
    const uploadPromises = imageFiles.map(async (file, index) => {
      try {
        setUploadProgress((index / imageFiles.length) * 100);
        const result = await uploadToCloudinary(file);
        return result.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast(`Failed to upload image: ${file.name}`, 'error');
        throw error;
      }
    });
    
    const results = await Promise.all(uploadPromises);
    setUploadProgress(100);
    return results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrls = [...formData.images];
      
      // Upload new images to Cloudinary
      if (imageFiles.length > 0) {
        showToast('Uploading images to Cloudinary...', 'info');
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const productData = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        rating: editingProduct?.rating || 4.5,
        reviews: editingProduct?.reviews || 0,
        updatedAt: new Date()
      };

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        showToast('Product updated successfully');
      } else {
        // Add new product
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
        showToast('Product added successfully');
      }

      resetForm();
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error saving product', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || product.desc || '',
      shortDescription: product.shortDescription || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || '',
      badges: product.badges || [],
      images: product.images || [],
      stock: product.stock?.toString() || '',
      sku: product.sku || '',
      weight: product.weight || '',
      nutritionalInfo: product.nutritionalInfo || '',
      origin: product.origin || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured || false,
      tags: product.tags || []
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? It will be moved to deleted products.')) return;

    try {
      // Get the product document
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (!productDoc.exists()) {
        showToast('Product not found', 'error');
        return;
      }

      const productData = productDoc.data();
      
      // Prepare deleted product data with isActive and isFeatured set to false
      const deletedProductData = {
        ...productData,
        isActive: false,
        isFeatured: false,
        deletedAt: new Date(),
        originalId: productId
      };

      // Add to del_products collection
      await addDoc(collection(db, 'del_products'), deletedProductData);

      // Remove from products collection
      await deleteDoc(doc(db, 'products', productId));

      // Clean up cart items containing this deleted product
      const cartQuery = query(
        collection(db, 'cart'),
        where('productId', '==', productId)
      );
      const cartSnapshot = await getDocs(cartQuery);
      const deleteCartPromises = cartSnapshot.docs.map(cartDoc => 
        deleteDoc(doc(db, 'cart', cartDoc.id))
      );
      await Promise.all(deleteCartPromises);

      showToast('Product deleted successfully and removed from all carts');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error deleting product', 'error');
    }
  };

  const handleRestore = async (productId) => {
    if (!confirm('Are you sure you want to restore this product?')) return;

    try {
      // Get the deleted product document
      const deletedProductDoc = await getDoc(doc(db, 'del_products', productId));
      
      if (!deletedProductDoc.exists()) {
        showToast('Deleted product not found', 'error');
        return;
      }

      const productData = deletedProductDoc.data();
      
      // Prepare restored product data with isActive set to true
      const restoredProductData = {
        ...productData,
        isActive: true,
        restoredAt: new Date(),
      };
      
      // Remove deletion-related fields
      delete restoredProductData.deletedAt;
      const originalProductId = restoredProductData.originalId;
      delete restoredProductData.originalId;

      // Restore with original ID if available, otherwise create new one
      if (originalProductId) {
        // Use the original product ID to maintain references
        await setDoc(doc(db, 'products', originalProductId), restoredProductData);
      } else {
        // Fallback: create with new ID
        await addDoc(collection(db, 'products'), restoredProductData);
      }

      // Remove from del_products collection
      await deleteDoc(doc(db, 'del_products', productId));

      showToast('Product restored successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error restoring product:', error);
      showToast('Error restoring product', 'error');
    }
  };

  const handlePermanentDelete = async (productId) => {
    if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone!')) return;

    try {
      // Permanently delete from del_products collection
      await deleteDoc(doc(db, 'del_products', productId));
      showToast('Product permanently deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error permanently deleting product:', error);
      showToast('Error deleting product', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      category: '',
      badges: [],
      images: [],
      stock: '',
      sku: '',
      weight: '',
      nutritionalInfo: '',
      origin: '',
      isActive: true,
      isFeatured: false,
      tags: []
    });
    setImageFiles([]);
    setUploadProgress(0);
    setEditingProduct(null);
  };

  const handleBadgeToggle = (badge) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader size="medium" text="Loading products..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'active'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Products
            </button>
            <button
              onClick={() => setViewMode('deleted')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'deleted'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deleted Products
            </button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {viewMode === 'active' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Product</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {viewMode === 'active' ? 'No Active Products' : 'No Deleted Products'}
          </h3>
          <p className="text-gray-500 mb-4">
            {viewMode === 'active' 
              ? 'Start by adding your first product' 
              : 'All deleted products will appear here'}
          </p>
          {viewMode === 'active' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Your First Product</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="relative">
              <img
                src={product.images?.[0] || '/placeholder-image.jpg'}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {viewMode === 'active' ? (
                  <>
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                      title="Edit Product"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                      title="Delete Product"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(product.id)}
                      className="bg-green-500/90 hover:bg-green-600 p-2 rounded-full transition-colors"
                      title="Restore Product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(product.id)}
                      className="bg-red-500/90 hover:bg-red-600 p-2 rounded-full transition-colors"
                      title="Permanently Delete"
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 flex-1">{product.title}</h3>
                {viewMode === 'deleted' && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    Deleted
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.desc || product.description}</p>
              {viewMode === 'deleted' && product.deletedAt && (
                <p className="text-xs text-gray-500 mb-2">
                  Deleted on: {new Date(product.deletedAt.seconds * 1000).toLocaleDateString()}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-amber-600">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter product title"
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Brief product description (appears in product cards)"
                      maxLength="150"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/150 characters</p>
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter detailed product description"
                    />
                  </div>

                  {/* SKU and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="LH001, LH002, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Price and Original Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
                    </div>
                  </div>

                  {/* Weight and Origin */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight/Volume <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="500g, 1kg, 250ml, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin
                      </label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Nepal, Himalayan Region, etc."
                      />
                    </div>
                  </div>

                  {/* Nutritional Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nutritional Information
                    </label>
                    <textarea
                      rows={2}
                      value={formData.nutritionalInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, nutritionalInfo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Energy: 304kcal per 100g, Carbohydrates: 82.4g, etc."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={handleTagsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="organic, natural, pure, himalayan"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tags help customers find your products</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active Product
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                        Featured Product
                      </label>
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badges
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {badgeOptions.map(badge => (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => handleBadgeToggle(badge)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.badges.includes(badge)
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Images
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Images (Max 5)
                    </label>
                    
                    {/* Cloudinary File Upload */}
                    <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg p-6">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <CloudArrowUpIcon className="h-12 w-12 text-amber-500 mb-2" />
                        <span className="text-sm font-medium text-amber-700">Click to upload images</span>
                        <span className="text-xs text-amber-600 mt-1">Powered by Cloudinary - Professional image hosting</span>
                        <span className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP (Max 5MB each)</span>
                      </label>
                    </div>
                    
                    {/* Upload Progress */}
                    {uploading && uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-amber-600">Uploading to Cloudinary...</span>
                          <span className="text-amber-600">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Preview new images */}
                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-amber-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default ProductManagement;
