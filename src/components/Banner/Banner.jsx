import React from "react";
import BannerImg from "../../assets/Banner/jar.png";
import Splash from "../../assets/Banner/splash2.png";
import { motion } from "framer-motion";
import { fadeUp } from "../../components/Products/Products";

const Banner = () => {
  return (
    <section>
      <div className="container grid grid-cols-1 md:grid-cols-2 space-y-6 md:space-y-0 gap-12">
        {/* Banner Image section */}
        <div className="relative">
          <motion.img
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            src={BannerImg}
            alt=""
            className="w-50 md:w-[400px] mx-auto relative z-10"
          />
          <motion.img
            initial={{ opacity: 0, y: -100, rotate: -180, scale: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            src={Splash}
            alt=""
            className="absolute bottom-10 z-0"
          />
        </div>
        {/* Banner Text info section */}
        <div className="flex flex-col justify-center">
          <div className="text-center md:text-left space-y-4 lg:max-w-[450px]">
            <motion.h1
              variants={fadeUp(0.7)}
              initial="hidden"
              whileInView="show"
              className="text-3xl lg:text-4xl font-semibold "
            >
              Sweet Treasures from Nepal's Highlands
            </motion.h1>
            <motion.p
              variants={fadeUp(0.5)}
              initial="hidden"
              whileInView="show"
              className="text-gray-500"
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
              className="!mt-5 border-2 border-primary text-primary px-6 py-2 rounded-md hover:bg-primary hover:text-white duration-200"
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
