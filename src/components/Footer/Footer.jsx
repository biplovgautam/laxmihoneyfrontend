import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin , FaPhone} from "react-icons/fa";
import { AiOutlineShopping } from "react-icons/ai"; // Using a generic shopping icon for Daraz
import { FaMapLocation } from "react-icons/fa6";
import CardsImg from "../../assets/credit-cards.webp";
import Logo from "../../assets/logo.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="bg-primary pt-12 pb-8 text-white">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* company details section */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
            className="space-y-6"
          >
            <img src={Logo} alt="" className="max-w-[100px] " />
            <div>
              <p className="flex items-center gap-2">
                <FaPhone />
                +977-9819492581
              </p>
              <p className="flex items-center gap-2 mt-2">
                {"Head  "}
                <FaMapLocation /> Kapilvastu, Nepal
              </p>
              <p className="flex items-center gap-2 mt-2">
                {"Branch  "}
                <FaMapLocation /> Kathmandu, Nepal
              </p>
            </div>
          </motion.div>
          {/* Footer Links section */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.6,
            }}
            className="space-y-6"
          ><h1 className="text-3xl font-bold">Quick Links</h1>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ul className="space-y-2">
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/">Home</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/about">About</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/contact">Contact us</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/Products">Products</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/Blogs">Blogs</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/contact">Contact us</Link>
                </li>
                <li className="hover:text-black transition duration-300 ease-in-out transform hover:scale-105 text-shadow ">
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
          </motion.div>
          {/* Social Links section */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.6,
            }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold">Follow us</h1>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-3xl hover:scale-105 transition duration-300 ease-in-out transform drop-shadow-lg hover:drop-shadow-xl" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-3xl hover:scale-105 transition duration-300 ease-in-out transform drop-shadow-lg hover:drop-shadow-xl" />
              </a>
              <a href="https://www.daraz.com.np" target="_blank" rel="noopener noreferrer">
                <AiOutlineShopping className="text-3xl hover:scale-105 transition duration-300 ease-in-out transform drop-shadow-lg hover:drop-shadow-xl" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="text-3xl hover:scale-105 transition duration-300 ease-in-out transform drop-shadow-lg hover:drop-shadow-xl" />
              </a>
            </div>
            <div className="space-y-2">
              <p>Payment Methods</p>
              <img src={CardsImg} alt="" />
            </div>
          </motion.div>
        </div>
        {/* copyright section */}
        <p className="text-center mt-8 border-t-2 border-white/40 pt-8">
          Copyright &copy; 2024. All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
