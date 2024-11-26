import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MdMenu, MdClose } from "react-icons/md";
import { FaRegUser, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";

const NavbarMenu = [
  {
    id: 1,
    title: "Home",
<<<<<<< HEAD
    link: "/",
=======
    link: "#",
>>>>>>> origin/main
  },
  {
    id: 2,
    title: "Products",
<<<<<<< HEAD
    link: "/products",
=======
    link: "#",
>>>>>>> origin/main
  },
  {
    id: 3,
    title: "Contact",
<<<<<<< HEAD
    link: "/contact",
=======
    link: "#",
>>>>>>> origin/main
  },
  {
    id: 4,
    title: "About",
<<<<<<< HEAD
    link: "/about",
=======
    link: "#",
>>>>>>> origin/main
  },
  {
    id: 5,
    title: "Blogs",
<<<<<<< HEAD
    link: "/blogs",
=======
    link: "#",
>>>>>>> origin/main
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Full-page overlay for mobile view */}
      {menuOpen && (
<<<<<<< HEAD
        <div className="fixed inset-0 md:hidden bg-black/10 backdrop-blur-md transition-all duration-300 ease-in-out z-40" onClick={closeMenu}></div>
      )}
=======
      <div className={`fixed inset-0 md:hidden bg-black/10 backdrop-blur-md transition-all duration-700 ease-in-out z-40 ${menuOpen ? 'top-0 transition-all duration-700 ease-in-out' : 'top-[-100%]'}`} onClick={closeMenu}></div>
    )}
>>>>>>> origin/main
      
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-transparent text-white">
        <div className="flex items-center justify-center">
          <Link to="/" className="transition duration-300 ease-in-out transform hover:scale-105 drop-shadow-md hover:drop-shadow-lg">
            <img className={`brand ml-2 ${menuOpen ? 'blur-md' : ''}`} src={Logo} alt="Logo" style={{ height: '75px' }} />
          </Link>
        </div>
        <div className={`nav-links ${menuOpen ? 'top-16 opacity-100' : 'top-[-400px] opacity-0'} absolute left-0 w-full bg-transparent md:static md:w-auto md:opacity-100 md:flex md:items-center ml-auto pr-4 transition-all duration-300 ease-in-out`}>
<<<<<<< HEAD
          <ul className={`flex flex-col md:flex-row gap-2.5 ${menuOpen ? 'items-center' : 'items-center'}`}>
            {NavbarMenu.map((item) => (
              <li key={item.id} className="p-2">
                <Link to={item.link} className="inline-block text-base font-semibold py-2 px-3 uppercase hover:text-black transition duration-300 ease-in-out transform hover:scale-110 text-shadow hover:text-shadow-white">
                  {item.title}
                </Link>
=======
          <ul className={`flex flex-col  md:flex-row gap-2.5 ${menuOpen ? 'items-center mt-[4rem] ' : 'items-center '}`}>
            {NavbarMenu.map((item) => (
              <li key={item.id} className="p-2">
                <a href={item.link} className="inline-block text-base font-semibold py-2 px-3 uppercase hover:text-black transition duration-300 ease-in-out transform hover:scale-110 text-shadow hover:text-shadow-white">
                  {item.title}
                </a>
>>>>>>> origin/main
              </li>
            ))}
            <li className="p-2 flex items-center space-x-4 w-32 justify-evenly">
              <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg">
                <FaShoppingCart className="drop-shadow-custom-lg hover:drop-shadow-custom-xl transform hover:scale-110" />
              </button>
              <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg mt-1">
<<<<<<< HEAD
                <FaRegUser className="drop-shadow-md hover:drop-shadow-lg transform hover:scale-110" />
=======
                <FaRegUser className="drop-shadow-custom-lg hover:drop-shadow-custom-xl transform hover:scale-110" />
>>>>>>> origin/main
              </button>
            </li>
          </ul>
        </div>
        <div className="md:hidden ml-auto z-50">
          {menuOpen ? (
            <MdClose className="text-4xl cursor-pointer transition duration-300 ease-in-out transform hover:scale-110" onClick={toggleMenu} />
          ) : (
            <MdMenu className="text-4xl cursor-pointer transition duration-300 ease-in-out transform hover:scale-110" onClick={toggleMenu} />
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;