import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaHeart, FaLeaf, FaAward } from "react-icons/fa";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";
import { motion } from "framer-motion";
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getOptimizedImageUrl } from '../../config/cloudinary';
import OrderButton from "../OrderButton";

export const fadeUp = (delay) => {
  return {
    hidden: {
      opacity: 0,
      y: 100,
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
      staggerChildren: 0.2,
    },
  },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Use simpler query without orderBy to avoid index requirements
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter and sort on client side
      const activeProducts = allProducts
        .filter(product => product.isActive)
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bDate - aDate; // Sort by newest first
        });
      
      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-16 lg:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl translate-x-40 translate-y-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-4">
            <FaLeaf className="w-4 h-4" />
            <span>Our Premium Collection</span>
            <HiSparkles className="w-4 h-4" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Pure Honey
            </span>
            <br />
            Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium honey varieties, 
            each offering unique flavors and health benefits from the pristine landscapes of Nepal.
          </p>
        </motion.div>
        
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                variants={fadeUp(0.1)}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link to={`/product/${item.id}`}>
                  <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden">
                    
                    {/* Stock Status */}
                    {item.stock === 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {item.originalPrice && calculateDiscount(item.price, item.originalPrice) > 0 && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          {calculateDiscount(item.price, item.originalPrice)}% OFF
                        </span>
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <div className="flex justify-center mb-6 relative">
                      <div className="relative group-hover:scale-110 transition-transform duration-500">
                        <img
                          src={item.images?.[0] ? getOptimizedImageUrl(item.images[0], { width: 300, height: 300 }) : '/placeholder-product.jpg'}
                          alt={item.title}
                          className="w-32 h-32 object-contain drop-shadow-2xl"
                        />
                        <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="flex justify-center mb-3">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    {/* Product Title */}
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-3 group-hover:text-amber-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm text-center mb-4 line-clamp-3">
                      {item.shortDescription || item.description}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {item.badges?.slice(0, 2).map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(item.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.rating || 4.5} ({item.reviews || 0} reviews)
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          ₹{formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-lg text-gray-400 line-through">
                            ₹{formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      {item.weight && (
                        <p className="text-sm text-gray-500 mt-1">{item.weight}</p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <OrderButton
                        disabled={item.stock === 0}
                        onClick={() => {
                          // Add to cart logic here
                          console.log('Adding to cart:', item.title);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          item.stock > 0
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        <span>{item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </OrderButton>
                      
                      <button className="p-3 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-xl transition-all duration-300 hover:shadow-lg">
                        <FaHeart className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Stock indicator */}
                    {item.stock > 0 && item.stock <= 5 && (
                      <div className="mt-3 text-center">
                        <span className="text-xs text-orange-600 font-medium">
                          Only {item.stock} left in stock!
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Products;
