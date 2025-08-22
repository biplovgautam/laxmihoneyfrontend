import React from "react";
import { motion } from "framer-motion";

const faqData = [
  {
    question: "What makes your honey pure and natural?",
    answer:
      "Our honey is harvested directly from pristine bee farms in Nepal's highlands, ensuring 100% pure, unprocessed honey with no artificial additives or preservatives.",
  },
  {
    question: "What types of honey do you offer?",
    answer:
      "We offer Raw Honey, Pure Honey, and rare Wild Honey varieties, each with unique flavors and health benefits from different floral sources.",
  },
  {
    question: "Is your honey organic and safe?",
    answer:
      "Yes, our honey is completely organic, harvested using traditional beekeeping methods without chemicals, making it safe for all ages.",
  },
  {
    question: "What are the health benefits of your honey?",
    answer: "Our honey is rich in antioxidants, enzymes, and minerals. It supports immunity, aids digestion, and provides natural energy.",
  },
  {
    question: "How should I store the honey?",
    answer: "Store honey in a cool, dry place away from direct sunlight. Crystallization is natural and doesn't affect quality - simply warm gently to liquify.",
  },
];
const FAQ = () => {
  const [active, setActive] = React.useState(null);
  const handleClick = (index) => {
    setActive(index === active ? null : index);
  };
  return (
    <section className="bg-gradient-to-br from-[#f3c23d]/5 to-[#bc7b13]/5 py-20 relative overflow-hidden">
      {/* Background glassmorphism elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#f3c23d]/20 to-[#bc7b13]/20 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
      
      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center pb-12 bg-gradient-to-r from-[#bc7b13] to-[#f3c23d] bg-clip-text text-transparent"
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-honey rounded-2xl border border-white/30 shadow-lg backdrop-blur-lg overflow-hidden"
            >
              <div
                className="flex justify-between items-center cursor-pointer p-6 hover:bg-white/10 transition-all duration-300"
                onClick={() => handleClick(index)}
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#bc7b13] pr-4">
                  {item.question}
                </h3>
                <span className="text-2xl font-bold text-[#f37623] w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                  {active === index ? "−" : "+"}
                </span>
              </div>

              {active === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <p className="text-gray-700 leading-relaxed text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
