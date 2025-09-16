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
  FaChevronRight,
  FaSearchPlus,
  FaTimes
} from 'react-icons/fa';
import { HiSparkles, HiBadgeCheck } from 'react-icons/hi';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LottieLoader } from '../components/LoadingSpinner';
import dataPreloader from '../services/dataPreloader';
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
    getCartItemQuantity 
  } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      
      // First try to get from preloaded data
      const preloadedProducts = dataPreloader.getProducts();
      if (preloadedProducts && preloadedProducts.length > 0) {
        const cachedProduct = preloadedProducts.find(p => p.id === productId);
        if (cachedProduct) {
          console.log('✅ Using cached product data');
          setProduct(cachedProduct);
          setLoading(false);
          return;
        }
      }

      // Fallback to API
      console.log('🔄 Fetching product with ID:', productId);
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        console.log('Product found:', productData);
        setProduct(productData);
      } else {
        console.log('Product not found, redirecting...');
        showToast('Product not found', 'error');
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
        limit(4)
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== productId); // Exclude current product
      
      setRelatedProducts(products.slice(0, 3));
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

  // Fetch product data when component mounts or productId changes
  useEffect(() => {
    console.log('useEffect triggered with productId:', productId);
    if (productId) {
      console.log('Calling fetchProductDetail...');
      fetchProductDetail().catch(err => {
        console.error('Error in fetchProductDetail:', err);
        setLoading(false);
      });
      fetchRecommendedProducts().catch(err => {
        console.error('Error in fetchRecommendedProducts:', err);
      });
    }
  }, [productId]); // Remove the dependency on functions to avoid infinite loop

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
      <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LottieLoader 
            size="large" 
            text="Loading product details..." 
            className="text-white"
          />
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/5 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6 relative z-10">
        {/* Breadcrumbs */}
        <nav className="mb-3 lg:mb-4">
          <div className="flex items-center space-x-2 text-white/70 text-xs lg:text-sm">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <span>/</span>
            <span className="text-white/50">{product.category}</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[150px]">{product.title}</span>
          </div>
        </nav>

        {/* Back Button */}
        {/* <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-4 lg:mb-6 flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </motion.button> */}

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8 lg:mb-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-square bg-white/15 backdrop-blur-md border border-white/25 rounded-xl overflow-hidden relative group">
                {product.images && product.images.length > 0 ? (
                  <>
                    {/* Main Image Display */}
                    <motion.img
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={getOptimizedImageUrl(product.images[selectedImageIndex], { width: 600, height: 600 })}
                      alt={product.title}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    
                    {/* Image Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100"
                        >
                          <FaChevronLeft className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100"
                        >
                          <FaChevronRight className="w-3 h-3" />
                        </motion.button>
                      </>
                    )}

                    {/* Image Dots Indicator */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                        {product.images.map((_, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              selectedImageIndex === index
                                ? 'bg-white scale-110 shadow-sm'
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Zoom Icon */}
                    <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaSearchPlus className="w-4 h-4" />
                    </div>

                    {/* Discount Badge */}
                    {product.originalPrice && calculateDiscount(product.price, product.originalPrice) > 0 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {calculateDiscount(product.price, product.originalPrice)}% OFF
                      </div>
                    )}

                    {/* Stock Status */}
                    {product.stock === 0 ? (
                      <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </div>
                    ) : product.stock <= 5 ? (
                      <div className="absolute bottom-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full animate-pulse">
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
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-amber-300 ring-1 ring-amber-300/50 shadow-md'
                        : 'border-white/25 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(image, { width: 150, height: 150 })}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 lg:space-y-6"
          >
            {/* Category Badge */}
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium rounded-full">
                {product.category}
              </span>
              {product.isFeatured && (
                <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-400/20 backdrop-blur-sm border border-amber-300/50 text-amber-200 text-xs font-medium rounded-full">
                  <HiSparkles className="w-3 h-3" />
                  <span>Featured</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            {/* Short Description */}
            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4.5) ? 'text-yellow-400' : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/80 font-medium text-sm">
                {(product.rating || 4.5).toFixed(1)} ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  ₹{formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-white/50 line-through">
                    ₹{formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-green-300 font-medium text-sm">
                  You save ₹{formatPrice(product.originalPrice - product.price)}
                </div>
              )}
              {product.weight && (
                <div className="text-white/70 text-sm">
                  Price per unit: {product.weight}
                </div>
              )}
            </div>

            {/* Product Badges */}
            {product.badges && product.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.badges.map((badge, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-300/30 text-blue-200 text-xs font-medium rounded-full"
                  >
                    {badge}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium text-sm">Qty:</span>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="w-3 h-3 text-white" />
                  </motion.button>
                  <motion.span 
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-semibold text-white min-w-[2rem] text-center text-sm"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors disabled:opacity-50"
                    disabled={quantity >= (product.stock || 999)}
                  >
                    <FaPlus className="w-3 h-3 text-white" />
                  </motion.button>
                </div>
                <span className="text-white/70 text-xs">
                  {product.stock} available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center space-x-2 ${
                    product.stock > 0
                      ? 'bg-white text-amber-600 hover:bg-white/90 shadow-md hover:shadow-lg'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart className="w-4 h-4" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    isFavorite(product.id)
                      ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <FaHeart className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppClick}
                  className="p-3 bg-green-500/80 hover:bg-green-600/80 text-white rounded-lg transition-all duration-300"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaLeaf className="w-5 h-5 text-green-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs font-medium">100% Natural</span>
              </div>
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaShieldAlt className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs font-medium">Quality Assured</span>
              </div>
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <FaTruck className="w-5 h-5 text-amber-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs font-medium">Fast Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 lg:mb-12"
        >
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-4 lg:p-6">
            <h2 className="text-xl font-bold text-white mb-4">Product Details</h2>
            
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
          <div className="text-center mb-6 lg:mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-[1px] bg-white/40"></div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">More for You</h2>
              <div className="w-12 h-[1px] bg-white/40"></div>
            </div>
            <p className="text-white/70 text-sm">Discover more premium honey products</p>
          </div>

          {relatedProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link to={`/product/${item.id}`}>
                    <div className="bg-black/15 backdrop-blur-md border border-white/25 rounded-xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full flex flex-col hover:bg-black/20 hover:border-white/35">
                      
                      {/* Background effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/5 rounded-xl"></div>
                      <div className="absolute inset-0 border border-white/15 rounded-xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                      
                      {/* Product Image */}
                      <div className="relative mb-3 lg:mb-4 flex-shrink-0">
                        <div className="aspect-square bg-black/15 backdrop-blur-sm border border-white/25 rounded-lg lg:rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-black/20 transition-all duration-500 relative">
                          <img
                            src={item.images?.[0] ? getOptimizedImageUrl(item.images[0], { width: 300, height: 300 }) : '/placeholder-product.jpg'}
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

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && product?.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getOptimizedImageUrl(product.images[selectedImageIndex], { width: 1200, height: 1200 })}
                alt={product.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Close Button */}
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-colors z-50"
              >
                <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Navigation in Modal */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-colors"
                  >
                    <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-colors"
                  >
                    <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {product.images.length}
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
          show={toast.show}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sticky Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-white/20 p-3 z-40">
        <div className="flex items-center space-x-3">
          {/* Price */}
          <div className="flex-1">
            <div className="text-amber-600 font-bold text-lg">
              ₹{formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-gray-500 line-through text-sm">
                ₹{formatPrice(product.originalPrice)}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleFavorite}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isFavorite(product.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHeart className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center space-x-2 ${
                product.stock > 0
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaShoppingCart className="w-4 h-4" />
              <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
