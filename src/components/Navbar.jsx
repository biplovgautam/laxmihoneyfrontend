import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MdMenu, MdClose } from "react-icons/md";
import { FaRegUser, FaShoppingCart } from "react-icons/fa";

const NavbarMenu = [
  {
    id: 1,
    title: "Home",
    link: "/",
  },
  {
    id: 2,
    title: "Products",
    link: "/products",
  },
  {
    id: 3,
    title: "Contact",
    link: "/contact",
  },
  {
    id: 4,
    title: "About",
    link: "/about",
  },
  {
    id: 5,
    title: "Blogs",
    link: "/blogs",
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="fixed w-full top-0 z-50 flex items-center justify-between p-4 bg-transparent text-white">
      <div className="flex items-center justify-center">
        <Link to="/" className="transition duration-300 ease-in-out transform hover:scale-105 drop-shadow-md hover:drop-shadow-lg">
          <img className={`brand ml-2 ${menuOpen ? 'blur-sm' : ''}`} src={Logo} alt="Logo" style={{ height: '75px',minWidth: '65px', objectFit: 'contain' }} />
        </Link>
      </div>
      
      <div ref={menuRef} className={`nav-links ${menuOpen ? 'top-0 opacity-100 h-screen backdrop-blur-md bg-black/10' : 'top-[-100%] opacity-0'} 
        absolute left-0 w-full md:h-auto md:bg-transparent md:backdrop-blur-none md:static md:w-auto md:opacity-100 md:flex md:items-center 
        ml-auto pr-4 transition-all duration-300 ease-in-out`}>
        <ul className={`flex flex-col md:flex-row gap-2.5 ${menuOpen ? 'items-center mt-32' : 'items-center'}`}>
          {NavbarMenu.map((item) => (
            <li key={item.id} className="p-2">
              <Link 
                to={item.link} 
                onClick={closeMenu}
                className="inline-block text-base font-semibold py-2 px-3 uppercase hover:text-black transition duration-300 ease-in-out transform hover:scale-110 text-shadow hover:text-shadow-white"
              >
                {item.title}
              </Link>
            </li>
          ))}
          <li className="p-2 flex items-center space-x-4 w-32 justify-evenly">
            <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg">
              <FaShoppingCart className="drop-shadow-custom-lg hover:drop-shadow-custom-xl transform hover:scale-110" />
            </button>
            <button className="text-xl hover:text-black transition duration-300 ease-in-out text-shadow hover:text-shadow-lg mt-1">
              <FaRegUser className="drop-shadow-custom-lg hover:drop-shadow-custom-xl transform hover:scale-110" />
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
  );
};

export default Navbar;