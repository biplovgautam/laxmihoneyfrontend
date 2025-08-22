import React from "react";
import { motion } from "framer-motion";
import Blog1 from "../../assets/Blogs/1.jpg";
import Blog2 from "../../assets/Blogs/2.jpg";
import Blog3 from "../../assets/Blogs/3.jpg";
import Blog4 from "../../assets/Blogs/4.jpg";

const BlogsData = [
  {
    id: 1,
    title: "The Sweet Journey of Pure Honey Production",
    desc: "Discover how our dedicated beekeepers work with nature to create the purest, most delicious honey while maintaining sustainable practices.",
    link: "#",
    img: Blog1,
  },
  {
    id: 2,
    title: "Health Benefits of Raw Unprocessed Honey",
    desc: "Learn about the incredible health benefits of consuming raw honey and how it can boost your immune system and overall wellness.",
    link: "#",
    img: Blog2,
  },
  {
    id: 3,
    title: "Sustainable Beekeeping: Our Commitment to Nature",
    desc: "Explore our eco-friendly beekeeping methods that support bee populations while producing premium quality honey products.",
    link: "#",
    img: Blog3,
  },
  {
    id: 4,
    title: "From Hive to Table: Our Quality Assurance Process",
    desc: "Take a behind-the-scenes look at our rigorous quality control process that ensures every jar meets our premium standards.",
    link: "#",
    img: Blog4,
  },
];

const Blogs = () => {
  return (
    <div className="w-full">
      <motion.h2 
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-4xl font-bold text-center pb-12 text-white"
      >
        Latest Stories
      </motion.h2>
      
      {/* card section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {BlogsData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:scale-105 hover:bg-white/25 duration-300 shadow-xl group"
          >
            <div className="w-full h-48 overflow-hidden rounded-xl mb-4">
              <img 
                src={item.img} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold line-clamp-2 text-white group-hover:text-amber-100 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="line-clamp-3 text-white/80 text-sm leading-relaxed">
                {item.desc}
              </p>
              <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:from-amber-500 hover:to-orange-600 hover:scale-105 duration-300 shadow-lg mt-4 border border-white/20">
                Read More
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
