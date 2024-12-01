import React from "react";
import P1 from '@assets/logo4.png';
import P2 from '@assets/logo2.png';
import P3 from '@assets/logo3.png';
import { Link } from "react-router-dom";

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
        duration: 0.5,
        delay: delay,
      },
    },
  };
};

const ProductsData = [
  {
    id: 1,
    title: "Raw Honey",
    image: P1,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima  ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima  ",
    price: '1000',

  },
  {
    id: 2,
    title: "Pure Honey",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima ",
    image: P2,
    price: '1000',
  },
  {
    id: 3,
    title: "Wild Honey",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima",
    image: P3,
    price: '1000',

  },
  {
    id: 4,
    title: "Raw Honey",
    image: P1,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima ",
    price: '1000',

  },
  {
    id: 5,
    title: "Pure Honey",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima ",
    image: P2,
    price: '1000',

  },
  {
    id: 6,
    title: "Wild Honey",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae iusto minima",
    image: P3,
    price: '1000',

  },
];

const Products = () => {
  return (
    <div className="bg-customorangedark pt-24 py-8 min-h-height">
      <div className="container py-14">
        <motion.h1
          variants={fadeUp(0.2)}
          initial="hidden"
          whileInView="show"
          className="text-3xl font-raleway font-bold text-white text-left md:ml-[4rem] pb-10"
        >
          OUR PRODUCTS
        </motion.h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-6">
        {ProductsData.map((item) => (
          <Link to={`/product/${item.id}`} key={item.id} className="group">
          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            whileInView={"show"}
            className="flex flex-col items-center justify-center p-5 max-w-[300px] mx-auto shadow-lg rounded-xl bg-customorangelight2 h-[380px] transform transition ease-in-out duration-300 group-hover:scale-105 group-hover:bg-customorangelight"
          >
            <img
              src={item.image}
              alt=""
              className="w-[100px] mb-4 group-hover:rotate-12 group-hover:scale-110 duration-300"
            />
            <div className="text-center space-y-2">
              <h1 className="text-2xl text-white font-semibold text-center">
                {item.title}
              </h1>
              <p className="text-center text-textdark text-sm text-gray-600 overflow-hidden text-ellipsis line-clamp-2">
                {item.desc}
              </p>
              <hr className="w-full mx-auto border-1 border-white" />
              <div className="flex justify-between items-center pt-8 mt-20 w-full px-4">
                <span className="text-lg text-white font-semibold">${item.price}</span> 
                <button className="border-2 border-white text-white px-4 py-2 rounded-md hover:bg-white hover:border-3 hover:scale-105 hover:text-customorangelight duration-200">
                  Add to cart
                </button>
              </div>
            </div>
          </motion.div>
        </Link>
        ))}
      </div>
      </div>
      
    </div>
  );
};

export default Products;
