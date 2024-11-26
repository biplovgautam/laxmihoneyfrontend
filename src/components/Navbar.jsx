import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MdMenu } from "react-icons/md";
import { FaRegUser, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";

const NavbarMenu = [
  {
    id: 1,
    title: "Home",
    link: "#",
  },
  {
    id: 2,
    title: "Categories",
    link: "#",
  },
  {
    id: 3,
    title: "Blog",
    link: "#",
  },
  {
    id: 4,
    title: "About",
    link: "#",
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-transparent text-white">
      <div className="flex items-center">
        <Link to="/" className="transition duration-300 ease-in-out transform hover:scale-105 drop-shadow-md hover:drop-shadow-lg">
          <img className="brand" src={Logo} alt="Logo" style={{ height: '75px' }} />
        </Link>
      </div>
      <div className={`nav-links ${menuOpen ? 'top-16 opacity-100' : 'top-[-400px] opacity-0'} absolute left-0 w-full bg-transparent md:static md:w-auto md:opacity-100 md:flex md:items-center ml-auto pr-4 transition-all duration-300 ease-in-out`}>
        <ul className="flex flex-col md:flex-row gap-2.5">
          {NavbarMenu.map((item) => (
            <li key={item.id} className="p-2">
              <a href={item.link} className="inline-block text-base font-semibold py-2 px-3 uppercase hover:text-black transition duration-300 ease-in-out transform hover:scale-110 text-shadow hover:text-shadow-white">
                {item.title}
              </a>
            </li>
          ))}
          <li className="p-2 flex items-center space-x-4 w-32 justify-evenly">
            <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg">
              <FaShoppingCart className="drop-shadow-custom-lg hover:drop-shadow-custom-xl transform hover:scale-110" />
            </button>
            <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg mt-1">
              <FaRegUser className="drop-shadow-md hover:drop-shadow-lg transform hover:scale-110" />
            </button>
          </li>
        </ul>
      </div>
      <div className="md:hidden ml-auto">
        <MdMenu className="text-4xl cursor-pointer" onClick={toggleMenu} />
      </div>
    </nav>
  );
};

export default Navbar;