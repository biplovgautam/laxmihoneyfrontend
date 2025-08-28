import React from "react";
import { motion } from "framer-motion";

const BannerText = () => {
  return (
    <section className="py-16 md:py-20 text-center bg-gradient-to-b from-white to-[#f3c23d]/5">
      <div className="container px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-br from-[#f3c23d] to-[#bc7b13] text-white rounded-3xl p-8 md:p-12 hover:scale-105 duration-500 hover:shadow-2xl relative overflow-hidden glass-honey border border-white/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-12 -translate-x-12"></div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-bold text-lg md:text-2xl lg:text-3xl max-w-[900px] mx-auto leading-relaxed relative z-10 drop-shadow-lg"
          >
            Experience the golden nectar of Nepal, where pure honey meets ancient 
            tradition, bringing nature's sweetness to your everyday wellness!
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default BannerText;
