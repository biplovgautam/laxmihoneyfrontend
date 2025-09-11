import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaWhatsapp, FaStar, FaLeaf, FaHeart, FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { quality } from "@cloudinary/url-gen/actions/delivery";

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dudoazt5g'
  }
});

const SlideRight = (delay) => {
  return {
    hidden: {
      opacity: 0,
      x: 100,
    },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: delay,
        ease: easeInOut,
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
  };
};

const FadeIn = (delay) => {
  return {
    hidden: {
      opacity: 0,
      y: 50,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: easeInOut,
      },
    },
  };
};

const scrollDown = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  });
};

const Hero = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // First try to get featured products
        const featuredQuery = query(
          collection(db, 'products'),
          where('isFeatured', '==', true),
          limit(3)
        );
        
        const featuredSnapshot = await getDocs(featuredQuery);
        let products = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(product => product.isActive); // Filter active products in client
        
        // If no featured products, get latest active products
        if (products.length === 0) {
          const allQuery = query(
            collection(db, 'products'),
            limit(10) // Get more to filter by isActive
          );
          
          const allSnapshot = await getDocs(allQuery);
          const allProducts = allSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filter active products and sort by creation date
          products = allProducts
            .filter(product => product.isActive)
            .sort((a, b) => {
              const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
              const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
              return bDate - aDate;
            })
            .slice(0, 3);
        }
        
        setFeaturedProducts(products);
        setActiveData(products[0] || null);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleActiveData = (data) => {
    setActiveData(data);
  };

  const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Extract public ID from Cloudinary URL
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)$/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      const optimizedImage = cld.image(publicId)
        .resize(auto().width(800))
        .delivery(quality('auto'));
      return optimizedImage.toURL();
    }
    return imageUrl;
  };

  if (loading) {
    return (
      <main className="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading featured products...</div>
      </main>
    );
  }

  if (!activeData) {
    return (
      <main className="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">No featured products available</div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <div className="container-modern relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center gap-8 lg:gap-12 pt-20 lg:pt-0">
          
          {/* Left Content Section */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left order-2 lg:order-1">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-white rounded-full text-white/90 text-sm font-medium">
                <HiBadgeCheck className="w-4 h-4 text-amber-200" />
                <span>100% Pure & Natural</span>
                <HiSparkles className="w-4 h-4 text-amber-200 animate-bounce-gentle" />
              </div>
            </motion.div>

            {/* Main Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id}
                variants={SlideRight(0.2)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                    {activeData.name || activeData.title}
                  </span>
                  <br />
                  <span className="text-2xl md:text-3xl lg:text-4xl font-medium text-amber-100/90 animate-glow">
                    from Nepal
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeData.id}
                variants={SlideRight(0.4)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="text-base md:text-lg leading-relaxed text-white/90 max-w-xl mx-auto lg:mx-0"
              >
                {activeData.description || activeData.desc}
              </motion.p>
            </AnimatePresence>

            {/* Features */}
            <motion.div
              variants={SlideRight(0.5)}
              initial="hidden"
              animate="show"
              className="flex flex-wrap justify-center lg:justify-start gap-6 text-white/80"
            >
              <div className="flex items-center gap-2">
                <FaLeaf className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <FaHeart className="w-5 h-5 text-red-300" />
                <span className="text-sm font-medium">Health Benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </motion.div>

            {/* Price and Action */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id}
                variants={SlideRight(0.6)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    Rs. {activeData.discountPrice || activeData.price}
                  </span>
                  {activeData.discountPrice && (
                    <span className="text-lg text-white/60 line-through">Rs. {activeData.price}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    Order Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    WhatsApp
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Product Badges */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id}
                variants={SlideRight(0.7)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-wrap justify-center lg:justify-start gap-2"
              >
                {(activeData.tags || activeData.badges || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-white"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Product Selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="!mt-12 space-y-6"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
                <p className="uppercase text-xs md:text-sm font-medium tracking-wide text-white/80">
                  Choose Your Honey
                </p>
                <div className="w-16 md:w-20 h-[1px] bg-white/40"></div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {featuredProducts.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActiveData(item)}
                    className={`relative cursor-pointer p-3 rounded-2xl transition-all duration-300 ${
                      activeData.id === item.id
                        ? "glass-white border-2 border-amber-300 shadow-lg"
                        : "glass hover:glass-white border border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={getOptimizedImageUrl(item.imageUrl || item.images?.[0])}
                          alt={item.name || item.title}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        {activeData.id === item.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                            <HiSparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.category}</h4>
                        <p className="text-xs text-white/70">Rs. {item.discountPrice || item.price}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Image Section */}
          <div className="flex justify-center items-center order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeData.id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10"
                >
                  <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full p-8 animate-float bg-gradient-to-br from-amber-200/30 to-orange-300/30 backdrop-blur-sm border border-white/20 shadow-2xl">
                    <img
                      src={getOptimizedImageUrl(activeData.imageUrl || activeData.images?.[0])}
                      alt={activeData.name || activeData.title}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                  
                  {/* Floating rating badge */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute top-8 -right-4 glass-white p-4 rounded-2xl shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <FaStar className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-bold text-white text-lg">{activeData.rating || 4.9}</p>
                        <p className="text-white/70 text-xs">Premium</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Floating discount badge */}
                  {activeData.discountPrice && (
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute bottom-8 -left-4 bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-2xl shadow-xl"
                    >
                      <p className="text-white font-bold text-sm">
                        {Math.round(((activeData.price - activeData.discountPrice) / activeData.price) * 100)}% OFF
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.button
            onClick={scrollDown}
            className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
            whileHover={{ y: -5 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-sm font-medium">Discover More</span>
            <FaChevronDown className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
};

export default Hero;
