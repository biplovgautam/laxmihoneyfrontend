import React from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const TrustSection = () => {
  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "15+", label: "Years Experience" },
    { number: "100%", label: "Pure & Natural" },
    { number: "500+", label: "Orders Monthly" }
  ];

  const testimonials = [
    {
      name: "Sita Sharma",
      location: "Kathmandu",
      rating: 5,
      text: "The best honey I've ever tasted. You can tell it's pure and natural. My family loves it!"
    },
    {
      name: "Ram Prasad",
      location: "Pokhara",
      rating: 5,
      text: "Excellent quality honey. I use it daily for my morning routine. Highly recommended!"
    },
    {
      name: "Maya Gurung",
      location: "Lalitpur",
      rating: 5,
      text: "Pure and authentic. Fast delivery and great packaging. Will definitely order again."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-modern">
        
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Laxmi Honey for their daily wellness.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-amber-100"
            >
              <div className="space-y-4">
                {/* Quote Icon */}
                <FaQuoteLeft className="w-8 h-8 text-amber-400" />
                
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-amber-500" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Customer Info */}
                <div className="pt-4 border-t border-amber-200">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustSection;
