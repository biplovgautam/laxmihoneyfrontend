import React from "react";
import P1 from '@assets/logo4.png';
import P2 from '@assets/logo2.png';
import P3 from '@assets/logo3.png';
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaHeart, FaLeaf, FaAward } from "react-icons/fa";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";
import { motion } from "framer-motion";

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

const ProductsData = [
  {
    id: 1,
    title: "Premium Raw Honey",
    image: P1,
    desc: "Pure, unprocessed honey from the pristine valleys of Nepal. Rich in natural enzymes and antioxidants, perfect for daily wellness.",
    price: '1,200',
    originalPrice: '1,500',
    rating: 4.9,
    reviews: 342,
    category: "Raw Honey",
    badges: ["100% Natural", "Organic", "Unprocessed"],
    inStock: true,
  },
  {
    id: 2,
    title: "Organic Wildflower Honey",
    desc: "A delightful blend from diverse wildflowers across Nepal's valleys. Bursting with natural flavors and health benefits.",
    image: P2,
    price: '950',
    originalPrice: '1,200',
    rating: 4.8,
    reviews: 287,
    category: "Wildflower",
    badges: ["Organic Certified", "Wildflower", "Multi-floral"],
    inStock: true,
  },
  {
    id: 3,
    title: "Himalayan Forest Honey",
    desc: "Rare and exotic honey from the pristine Himalayan forests. Dark, richly flavored with unique medicinal properties.",
    image: P3,
    price: '1,800',
    originalPrice: '2,200',
    rating: 5.0,
    reviews: 156,
    category: "Forest Honey",
    badges: ["Himalayan", "Limited Edition", "Medicinal"],
    inStock: true,
  },
  {
    id: 4,
    title: "Mountain Clover Honey",
    image: P1,
    desc: "Sweet and aromatic honey from high-altitude clover fields. Light colored with a delicate floral taste perfect for tea and desserts.",
    price: '1,100',
    originalPrice: '1,400',
    rating: 4.7,
    reviews: 198,
    category: "Clover Honey",
    badges: ["Mountain Source", "Floral", "Light Color"],
    inStock: true,
  },
  {
    id: 5,
    title: "Acacia Blossom Honey",
    desc: "Crystal clear honey with mild, delicate flavor. Slow to crystallize, making it perfect for long-term storage and gourmet cooking.",
    image: P2,
    price: '1,350',
    originalPrice: '1,650',
    rating: 4.6,
    reviews: 234,
    category: "Acacia Honey",
    badges: ["Clear Color", "Mild Flavor", "Slow Crystallizing"],
    inStock: false,
  },
  {
    id: 6,
    title: "Traditional Bee Honey",
    desc: "Classic honey blend from traditional beekeeping methods. Rich in natural minerals and perfect for everyday use.",
    image: P3,
    price: '850',
    originalPrice: '1,100',
    rating: 4.5,
    reviews: 445,
    category: "Traditional",
    badges: ["Traditional Method", "Mineral Rich", "Everyday Use"],
    inStock: true,
  },
];

const Products = () => {
  return (
    <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-16 lg:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl translate-x-40 translate-y-40"></div>
      
      <div className="container-modern relative z-10">
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {ProductsData.map((item, index) => (
            <motion.div
              key={item.id}
              variants={fadeUp(0.1)}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Link to={`/product/${item.id}`}>
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden">
                  
                  {/* Stock Status */}
                  {!item.inStock && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {item.originalPrice && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                        {Math.round(((parseFloat(item.originalPrice.replace(/,/g, '')) - parseFloat(item.price.replace(/,/g, ''))) / parseFloat(item.originalPrice.replace(/,/g, ''))) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  
                  {/* Product Image */}
                  <div className="flex justify-center mb-6 relative">
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={item.image}
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
                    {item.desc}
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
                            i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {item.rating} ({item.reviews})
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">
                        Rs. {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          Rs. {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      disabled={!item.inStock}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                        item.inStock
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <FaShoppingCart className="w-4 h-4" />
                      <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                    
                    <button className="p-3 bg-white border-2 border-amber-200 text-amber-600 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                      <FaHeart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* View All Products Button */}
        <motion.div
          variants={fadeUp(0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <span>View All Products</span>
            <HiSparkles className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Products;
