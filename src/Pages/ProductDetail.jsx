import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaShoppingCart, 
  FaHeart, 
  FaArrowLeft, 
  FaWhatsapp, 
  FaLeaf, 
  FaShieldAlt, 
  FaTruck, 
  FaPlus, 
  FaMinus,
  FaCheck,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { HiSparkles, HiBadgeCheck } from 'react-icons/hi';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addToCart, 
    removeFromCart, 
    toggleFavorite, 
    isInCart, 
    isFavorite, 
    getCartItemQuantity,
    updateCartQuantity 
  } = useCart();

  const [product, setProduct] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProductDetail();
    fetchRecommendedProducts();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        setProduct(productData);
      } else {
        navigate('/products'); // Redirect if product not found
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Error loading product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      // For now, get random products (later will be algorithm-based)
      const q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        limit(4)
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== productId); // Exclude current product
      
      setRecommendedProducts(products.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recommended products:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    if (product.stock === 0) {
      showToast('This item is out of stock', 'error');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      showToast(`${quantity} ${product.title} added to cart!`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast('Please login to manage favorites', 'error');
      return;
    }

    try {
      await toggleFavorite(product.id);
      const isFav = isFavorite(product.id);
      showToast(
        isFav 
          ? `${product.title} removed from favorites` 
          : `${product.title} added to favorites!`, 
        'success'
      );
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "+9779819492581";
    const message = `Hi! I'm interested in ${product.title}. Could you please provide more information?`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[+\s]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white/80 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <Link 
            to="/products"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-square bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-3xl overflow-hidden relative">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={getOptimizedImageUrl(product.images[selectedImageIndex], { width: 800, height: 800 })}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
                        >
                          <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
                        >
                          <FaChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Discount Badge */}
                    {product.originalPrice && calculateDiscount(product.price, product.originalPrice) > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {calculateDiscount(product.price, product.originalPrice)}% OFF
                      </div>
                    )}

                    {/* Stock Status */}
                    {product.stock === 0 ? (
                      <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </div>
                    ) : product.stock <= 5 ? (
                      <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full animate-pulse">
                        Only {product.stock} left!
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-white/50">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-amber-300 ring-2 ring-amber-300/50'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(image, { width: 200, height: 200 })}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Category Badge */}
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium rounded-full">
                {product.category}
              </span>
              {product.isFeatured && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-amber-400/20 backdrop-blur-sm border border-amber-300/50 text-amber-200 text-sm font-medium rounded-full">
                  <HiSparkles className="w-4 h-4" />
                  <span>Featured</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            {/* Short Description */}
            <p className="text-lg text-white/90 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 4.5) ? 'text-yellow-400' : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/80 font-medium">
                {(product.rating || 4.5).toFixed(1)} ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-white">
                  ₹{formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-white/50 line-through">
                    ₹{formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-green-300 font-medium">
                  You save ₹{formatPrice(product.originalPrice - product.price)}
                </div>
              )}
              {product.weight && (
                <div className="text-white/70">
                  Price per unit: {product.weight}
                </div>
              )}
            </div>

            {/* Product Badges */}
            {product.badges && product.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-400/20 backdrop-blur-sm border border-blue-300/50 text-blue-200 text-sm font-medium rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Quantity:</span>
                <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="w-3 h-3 text-white" />
                  </button>
                  <span className="font-semibold text-white min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    disabled={quantity >= (product.stock || 999)}
                  >
                    <FaPlus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <span className="text-white/70 text-sm">
                  {product.stock} available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 text-lg flex items-center justify-center space-x-2 ${
                    product.stock > 0
                      ? 'bg-white text-amber-600 hover:bg-white/90 shadow-lg hover:shadow-xl'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleFavorite}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isFavorite(product.id)
                      ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <FaHeart className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppClick}
                  className="p-4 bg-green-500/80 hover:bg-green-600/80 text-white rounded-xl transition-all duration-300"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaLeaf className="w-6 h-6 text-green-300 mx-auto mb-2" />
                <span className="text-white/90 text-sm font-medium">100% Natural</span>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaShieldAlt className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <span className="text-white/90 text-sm font-medium">Quality Assured</span>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaTruck className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                <span className="text-white/90 text-sm font-medium">Fast Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="bg-white/15 backdrop-blur-md border-2 border-white/30 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Product Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                <p className="text-white/90 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                <div className="space-y-3">
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Weight/Volume:</span>
                      <span className="text-white font-medium">{product.weight}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Origin:</span>
                      <span className="text-white font-medium">{product.origin}</span>
                    </div>
                  )}
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-white/70">SKU:</span>
                      <span className="text-white font-medium">{product.sku}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/70">Category:</span>
                    <span className="text-white font-medium">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutritional Information */}
            {product.nutritionalInfo && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Nutritional Information</h3>
                <p className="text-white/90 leading-relaxed">
                  {product.nutritionalInfo}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommended Products */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-[1px] bg-white/40"></div>
              <h2 className="text-3xl font-bold text-white">More for You</h2>
              <div className="w-16 h-[1px] bg-white/40"></div>
            </div>
            <p className="text-white/70">Discover more premium honey products</p>
          </div>

          {recommendedProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link to={`/product/${item.id}`}>
                    <div className="bg-black/15 backdrop-blur-md border-2 border-white/25 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full flex flex-col hover:bg-black/20 hover:border-white/35">
                      
                      {/* Background effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/5 rounded-3xl"></div>
                      <div className="absolute inset-0 border border-white/15 rounded-3xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                      
                      {/* Product Image */}
                      <div className="relative mb-4 flex-shrink-0">
                        <div className="aspect-square bg-black/15 backdrop-blur-sm border-2 border-white/25 rounded-2xl flex items-center justify-center overflow-hidden group-hover:bg-black/20 transition-all duration-500 relative">
                          <img
                            src={item.images?.[0] ? getOptimizedImageUrl(item.images[0], { width: 400, height: 400 }) : '/placeholder-product.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10 rounded-2xl"
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col relative z-10">
                        <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-sm">
                          {item.title}
                        </h3>
                        <p className="text-white/80 text-sm mb-4 line-clamp-2 drop-shadow-sm">
                          {item.shortDescription}
                        </p>
                        
                        {/* Price */}
                        <div className="mt-auto">
                          <div className="flex items-baseline space-x-2 mb-3">
                            <span className="text-xl font-bold text-white drop-shadow-sm">
                              ₹{formatPrice(item.price)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-white/60 line-through drop-shadow-sm">
                                ₹{formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-3 h-3 drop-shadow-sm ${
                                  i < Math.floor(item.rating || 4.5) ? 'text-yellow-400' : 'text-white/40'
                                }`}
                              />
                            ))}
                            <span className="text-white/70 text-xs ml-1 drop-shadow-sm">
                              ({item.reviews || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
