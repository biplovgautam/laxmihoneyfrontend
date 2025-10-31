import React from 'react';
import { motion } from 'framer-motion';
import { GiHoneypot, GiBee } from 'react-icons/gi';
import { FaAward, FaLeaf, FaShieldAlt, FaTruck } from 'react-icons/fa';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <GiHoneypot className="w-8 h-8" />,
      title: "100% Pure Honey",
      description: "Unprocessed, natural honey directly from our hives with no additives or preservatives."
    },
    {
      icon: <FaAward className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Carefully harvested and quality-tested to ensure the finest honey reaches your table."
    },
    {
      icon: <GiBee className="w-8 h-8" />,
      title: "Sustainable Beekeeping",
      description: "We practice ethical beekeeping that protects bee populations and supports the environment."
    },
    {
      icon: <FaTruck className="w-8 h-8" />,
      title: "Fresh Delivery",
      description: "From hive to home - we ensure your honey arrives fresh and perfectly sealed."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#fffef8] to-amber-50/30">
      <div className="container-modern">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-amber-600">Laxmi Honey</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by families across Nepal for authentic, pure honey that brings nature's goodness to your home.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {reason.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900">
                    {reason.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {reason.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-amber-200">
            <FaShieldAlt className="w-5 h-5 text-amber-600" />
            <span className="text-gray-700 font-medium">Certified & Quality Assured</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
