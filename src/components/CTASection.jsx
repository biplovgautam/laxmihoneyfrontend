import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import { GiHoneypot } from 'react-icons/gi';

const CTASection = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+9779819492581";
    const message = "Hi! I'm interested in ordering pure honey from Laxmi Honey Industry. Can you help me?";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[+\s]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="container-modern relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <GiHoneypot className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Experience Pure Honey?
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Order now and get fresh, authentic honey delivered straight to your doorstep. 
            Join thousands of happy customers enjoying nature's finest gift.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-amber-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-lg"
              >
                <FaShoppingCart className="w-5 h-5" />
                Shop Now
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppClick}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-lg"
            >
              <FaWhatsapp className="w-5 h-5" />
              Order via WhatsApp
            </motion.button>
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-white/80 text-sm"
          >
            <p>✓ Free Delivery on Orders Above Rs. 1000 • ✓ 100% Satisfaction Guaranteed</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
