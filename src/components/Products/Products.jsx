import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaHeart, FaSearch, FaFilter, FaSort, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getOptimizedImageUrl } from '../../config/cloudinary';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { LottieLoader } from '../LoadingSpinner';
import dataPreloader from '../../services/dataPreloader';
import OrderButton from "../OrderButton";
import Toast from "../Toast";


// Custom CSS for range sliders
const rangeSliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: transparent;
    outline:                    </d                                  </motion.button>
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })}          <FaHeart className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })}           </motion.button>
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })}                </div>
                </div>
              </motion.div>
              );
            })};
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .slider:hover {
    opacity: 1;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f59e0b, #f97316);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f59e0b, #f97316);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = rangeSliderStyles;
  document.head.appendChild(styleSheet);
}

export const fadeUp = (delay) => {
  return {
    hidden: {
      opacity: 0,
      y: 30,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      },
    },
  };
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]); // Changed to array for slider
  const [sortBy, setSortBy] = useState("newest");
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Temporary filter states for sidebar (don't apply until user clicks apply or closes sidebar)
  const [tempSelectedCategory, setTempSelectedCategory] = useState("all");
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000]);

  // Cart and favorites functionality
  const { user } = useAuth();
  const { 
    addToCart, 
    removeFromCart, 
    toggleFavorite, 
    isInCart, 
    isFavorite, 
    getCartItemQuantity 
  } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // First try to get preloaded data
      const preloadedProducts = dataPreloader.getProducts();
      
      if (preloadedProducts && preloadedProducts.length > 0) {
        console.log('✅ Using preloaded products');
        setProducts(preloadedProducts);
        setFilteredProducts(preloadedProducts);
        setLoading(false);
        return;
      }

      // Fallback to API if no preloaded data
      console.log('🔄 Fetching products from API...');
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Add test product if no products found
      if (allProducts.length === 0) {
        allProducts.push({
          id: 'test-1',
          title: 'Pure Himalayan Honey',
          shortDescription: 'Raw, unprocessed honey from the Himalayas',
          price: 999,
          originalPrice: 1299,
          category: 'pure honey',
          images: ['/placeholder-product.jpg'],
          stock: 10,
          weight: '500g',
          rating: 4.5,
          reviews: 25,
          badges: ['Organic', 'Premium'],
          isActive: true
        });
      }
      
      console.log('All products fetched:', allProducts.length);
      
      const activeProducts = allProducts
        .filter(product => product.isActive)
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bDate - aDate;
        });
      
      console.log('Active products:', activeProducts.length);
      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Enhanced search filter - search across all relevant fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.shortDescription?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.weight?.toLowerCase().includes(searchLower) ||
        product.origin?.toLowerCase().includes(searchLower) ||
        product.badges?.some(badge => badge.toLowerCase().includes(searchLower)) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter - using slider values
    filtered = filtered.filter(product => {
      const price = product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort filter
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bDate - aDate;
        });
        break;
    }

    console.log('Filtered products:', filtered.length);
    setFilteredProducts(filtered);
  };

  // Apply filters from sidebar
  const applyFilters = () => {
    setSelectedCategory(tempSelectedCategory);
    setPriceRange(tempPriceRange);
    setShowFilterSidebar(false);
  };

  // Handle sidebar close (apply filters)
  const handleSidebarClose = () => {
    applyFilters();
  };

  // Reset filters
  const resetFilters = () => {
    setTempSelectedCategory("all");
    setTempPriceRange([0, 10000]);
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
  };

  // Initialize temp filters when sidebar opens
  const handleFilterOpen = () => {
    setTempSelectedCategory(selectedCategory);
    setTempPriceRange(priceRange);
    setShowFilterSidebar(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const categories = ["all", "pure honey", "raw honey", "flavoured honey", "mad honey", "gift sets", "honey bee products", "seasonal", "other"];

  // Toast functionality
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cart functionality
  const handleAddToCart = async (product) => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    if (product.stock === 0) {
      showToast('This item is out of stock', 'error');
      return;
    }

    try {
      const result = await addToCart(product.id, 1);
      if (result.action === 'added') {
        showToast(`${product.title} added to cart!`, 'success');
      } else if (result.action === 'updated') {
        showToast(`${product.title} quantity updated in cart (${result.newQuantity})`, 'success');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleRemoveFromCart = async (product) => {
    if (!user) {
      showToast('Please login to manage cart', 'error');
      return;
    }

    try {
      await removeFromCart(product.id);
      showToast(`${product.title} removed from cart`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Favorites functionality
  const handleToggleFavorite = async (product) => {
    if (!user) {
      showToast('Please login to manage favorites', 'error');
      return;
    }

    try {
      const result = await toggleFavorite(product.id);
      if (result.action === 'added') {
        showToast(`${product.title} added to favorites!`, 'success');
      } else if (result.action === 'removed') {
        showToast(`${product.title} removed from favorites`, 'success');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <LottieLoader 
              size="large" 
              text="Gathering our premium honey collection..." 
              className="text-white"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchProducts();
              }}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Search Bar with Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        {/* Enhanced Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white text-lg z-10" />
          <input
            type="text"
            placeholder="Search honey products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-20 py-5 bg-white/15 backdrop-blur-md border-2 border-white/30 rounded-3xl focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all duration-300 text-lg text-white placeholder-white/70 font-medium"
          />
          <button
            onClick={handleFilterOpen}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all duration-300 z-10"
          >
            <FaFilter className="text-white text-lg" />
          </button>
        </div>

        {/* Results count */}
        <div className="text-center mt-4">
          <p className="text-white/80 text-lg">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </motion.div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilterSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleSidebarClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-80 md:w-96 lg:w-80 bg-white/15 backdrop-blur-xl border-l border-white/30 z-50 overflow-y-auto pt-20"
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <FaFilter className="text-amber-400" />
                    Filters
                  </h3>
                  <button
                    onClick={handleSidebarClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <FaTimes className="text-white text-lg sm:text-xl" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Category</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {categories.map(category => (
                      <label key={category} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={tempSelectedCategory === category}
                          onChange={(e) => setTempSelectedCategory(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 transition-all ${
                          tempSelectedCategory === category 
                            ? 'border-amber-400 bg-amber-400' 
                            : 'border-white/50 group-hover:border-white/70'
                        }`}>
                          {tempSelectedCategory === category && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mx-auto mt-0.5 sm:mt-1"></div>
                          )}
                        </div>
                        <span className={`text-xs sm:text-sm transition-colors ${
                          tempSelectedCategory === category ? 'text-amber-200' : 'text-white/80 group-hover:text-white'
                        }`}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Price Range</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Price display */}
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-xs sm:text-sm">₹{tempPriceRange[0].toLocaleString()}</span>
                      <span className="text-white/80 text-xs sm:text-sm">₹{tempPriceRange[1].toLocaleString()}</span>
                    </div>
                    
                    {/* Dual Range Slider */}
                    <div className="relative">
                      <div className="relative h-2 bg-white/20 rounded-full">
                        {/* Active range */}
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                          style={{
                            left: `${(tempPriceRange[0] / 10000) * 100}%`,
                            width: `${((tempPriceRange[1] - tempPriceRange[0]) / 10000) * 100}%`
                          }}
                        ></div>
                        
                        {/* Min slider */}
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={tempPriceRange[0]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value <= tempPriceRange[1]) {
                              setTempPriceRange([value, tempPriceRange[1]]);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider"
                          style={{ background: 'transparent' }}
                        />
                        
                        {/* Max slider */}
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={tempPriceRange[1]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= tempPriceRange[0]) {
                              setTempPriceRange([tempPriceRange[0], value]);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider"
                          style={{ background: 'transparent' }}
                        />
                      </div>
                    </div>
                    
                    {/* Quick preset buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4">
                      {[
                        { range: [0, 500], label: "Under ₹500" },
                        { range: [500, 1000], label: "₹500-1K" },
                        { range: [1000, 2000], label: "₹1K-2K" },
                        { range: [2000, 10000], label: "₹2K+" }
                      ].map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => setTempPriceRange(preset.range)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs rounded-lg transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-colors border border-white/20"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <HiSparkles className="mx-auto text-8xl text-white/30 mb-6" />
              <h3 className="text-3xl font-semibold text-white mb-4">No products found</h3>
              <p className="text-white/70 mb-6">Try adjusting your search or filter criteria</p>
              <p className="text-white/50 text-sm">
                Total products available: {products.length}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((item, index) => {
              console.log('Rendering product card:', item.title, 'Index:', index);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                <div className="bg-black/15 backdrop-blur-md border-2 border-white/25 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full flex flex-col hover:bg-black/20 hover:border-white/35"
                  style={{ minHeight: '500px' }}
                >
                  
                  {/* Blackish glassmorphism background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/5 rounded-3xl"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.08),transparent_50%)] rounded-3xl"></div>
                  
                  {/* Subtle edge highlight for visibility */}
                  <div className="absolute inset-0 border border-white/15 rounded-3xl"></div>
                  
                  {/* Background Glow Effect - softer amber glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  
                  {/* Top badges row */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    {/* Discount Badge */}
                    {item.originalPrice && calculateDiscount(item.price, item.originalPrice) > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                      >
                        {calculateDiscount(item.price, item.originalPrice)}% OFF
                      </motion.div>
                    )}

                    {/* Stock Status */}
                    {item.stock === 0 ? (
                      <div className="bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </div>
                    ) : item.stock <= 5 ? (
                      <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full animate-pulse">
                        Only {item.stock} left!
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Product Image */}
                  <div className="relative mb-6 flex-shrink-0 mt-4">
                    <Link to={`/product/${item.id}`}>
                      <div className="aspect-square bg-black/15 backdrop-blur-sm border-2 border-white/25 rounded-2xl flex items-center justify-center overflow-hidden group-hover:bg-black/20 transition-all duration-500 relative">
                        {/* Image glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <img
                          src={item.images?.[0] ? getOptimizedImageUrl(item.images[0], { width: 400, height: 400 }) : '/placeholder-product.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10 rounded-2xl"
                        />
                        
                        {/* Weight/Volume Badge - Bottom Right */}
                        {item.weight && (
                          <div className="absolute bottom-3 right-3 z-20">
                            <span className="inline-flex items-center px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/20">
                              {item.weight}
                            </span>
                          </div>
                        )}
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex-1 flex flex-col relative z-10">
                    {/* Category and Featured Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-sm border border-white/50 text-gray-800 text-xs font-medium rounded-full shadow-sm">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/90 backdrop-blur-sm border border-amber-300/50 text-amber-900 text-xs font-medium rounded-full">
                          <HiSparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Title */}
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors duration-300 line-clamp-2 leading-tight drop-shadow-sm">
                        {item.title}
                      </h3>
                    </Link>
                    
                    {/* Short Description */}
                    <p className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed drop-shadow-sm">
                      {item.shortDescription || item.description || "Premium quality honey product crafted with care and dedication."}
                    </p>
                    
                    {/* Product Badges */}
                    {item.badges && item.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.badges.slice(0, 2).map((badge, badgeIndex) => (
                          <span
                            key={badgeIndex}
                            className="px-2 py-1 bg-blue-400/90 backdrop-blur-sm border border-blue-300/50 text-blue-900 text-xs font-medium rounded-md shadow-sm"
                          >
                            {badge}
                          </span>
                        ))}
                        {item.badges.length > 2 && (
                          <span className="px-2 py-1 bg-white/95 backdrop-blur-sm border border-white/50 text-gray-700 text-xs rounded-md shadow-sm">
                            +{item.badges.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 drop-shadow-sm ${
                              i < Math.floor(item.rating || 4.5) ? 'text-yellow-400' : 'text-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-white/90 font-medium drop-shadow-sm">
                        {(item.rating || 4.5).toFixed(1)}
                      </span>
                      <span className="text-sm text-white/70 drop-shadow-sm">
                        ({item.reviews || 0} reviews)
                      </span>
                    </div>
                    
                    {/* Price Section */}
                    <div className="mb-6 mt-auto">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-white drop-shadow-sm">
                          ₹{formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-lg text-white/60 line-through drop-shadow-sm">
                            ₹{formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-sm text-green-300 font-medium drop-shadow-sm">
                          You save ₹{formatPrice(item.originalPrice - item.price)}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <OrderButton
                        disabled={item.stock === 0}
                        onClick={() => {
                          console.log('Buy now:', item.title);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-sm relative overflow-hidden ${
                          item.stock > 0
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        {item.stock > 0 ? (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>Buy Now</span>
                          </span>
                        ) : (
                          'Out of Stock'
                        )}
                      </OrderButton>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isInCart(item.id)
                            ? 'bg-amber-500/80 text-white hover:bg-amber-600/80'
                            : 'bg-white/80 text-amber-600 hover:bg-white hover:text-amber-700'
                        }`}
                        onClick={() => {
                          if (isInCart(item.id)) {
                            handleRemoveFromCart(item);
                          } else {
                            handleAddToCart(item);
                          }
                        }}
                        disabled={item.stock === 0}
                      >
                        <FaShoppingCart className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isFavorite(item.id)
                            ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                            : 'bg-white/80 text-red-600 hover:bg-white hover:text-red-700'
                        }`}
                        onClick={() => handleToggleFavorite(item)}
                      >
                        <FaHeart className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Products;
