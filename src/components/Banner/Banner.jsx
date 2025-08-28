import React from "react";
import BannerImg from "../../assets/Banner/jar.png";
import Splash from "../../assets/Banner/splash2.png";
import { motion } from "framer-motion";
import { fadeUp } from "../../components/Products/Products";

const Banner = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#f3c23d]/10 to-[#bc7b13]/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#f3c23d]/20 to-[#bc7b13]/20 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#f3c23d]/15 to-[#bc7b13]/15 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      
      <div className="container grid grid-cols-1 md:grid-cols-2 space-y-8 md:space-y-0 gap-12 px-4 md:px-8 relative z-10">
        {/* Banner Image section */}
        <div className="relative flex justify-center md:justify-start">
          <motion.img
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            src={BannerImg}
            alt=""
            className="w-64 md:w-[400px] lg:w-[450px] mx-auto relative z-10 drop-shadow-2xl"
          />
          <motion.img
            initial={{ opacity: 0, y: -100, rotate: -180, scale: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            src={Splash}
            alt=""
            className="absolute bottom-0 md:bottom-10 left-1/2 transform -translate-x-1/2 z-0 w-48 md:w-auto opacity-70"
          />
        </div>
        {/* Banner Text info section */}
        <div className="flex flex-col justify-center px-4">
          <div className="text-center md:text-left space-y-6 lg:max-w-[500px]">
            <motion.h1
              variants={fadeUp(0.7)}
              initial="hidden"
              whileInView="show"
              className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#bc7b13] to-[#f3c23d] bg-clip-text text-transparent leading-tight"
            >
              Sweet Treasures from Nepal's Highlands
            </motion.h1>
            <motion.p
              variants={fadeUp(0.5)}
              initial="hidden"
              whileInView="show"
              className="text-gray-600 leading-relaxed text-base md:text-lg"
            >
              Discover the pure essence of Nepali honey, carefully harvested from the pristine 
              foothills of the Himalayas. Our honey embodies centuries of traditional 
              beekeeping wisdom, offering you nature's finest sweetener packed with 
              incredible health benefits. From raw mountain honey to rare wild varieties, 
              each jar brings you the authentic taste of Nepal's untouched landscapes.
            </motion.p>
            <motion.button
              variants={fadeUp(0.6)}
              initial="hidden"
              whileInView="show"
              className="!mt-8 bg-[#f37623] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e06519] hover:shadow-lg duration-300 transform hover:scale-105 glass-accent shadow-lg"
            >
              Buy Now
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
