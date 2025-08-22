import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MdMenu, MdClose } from "react-icons/md";
import { FaRegUser, FaShoppingCart, FaCog, FaUserCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const NavbarMenu = useMemo(
    () => [
      { id: 1, title: "Home", link: "/" },
      { id: 2, title: "Products", link: "/products" },
      { id: 3, title: "Contact", link: "/contact" },
      { id: 4, title: "About", link: "/about" },
      { id: 5, title: "Blogs", link: "/blogs" },
    ],
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    if (menuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen, lastScrollY]);

  const handleUserClick = () => {
    if (user) {
      navigate('/account');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (!user) return null;
    if (user.photoURL) return user.photoURL;
    const name = user.displayName || user.email?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        lastScrollY > 50 
          ? "glass-honey shadow-xl border-b border-amber-200/30 backdrop-blur-xl" 
          : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={Logo}
                  alt="Laxmi Honey"
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-full object-cover ring-2 ring-amber-300/50 group-hover:ring-amber-400/70 transition-all duration-300"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <HiSparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent drop-shadow-sm">
                  Laxmi Honey
                </h1>
                <p className="text-xs text-amber-100/80 -mt-1">Pure & Natural</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NavbarMenu.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.link}
                  className="px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <span className="font-medium text-sm lg:text-base">{item.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section - User & Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl glass hover:glass-accent transition-all duration-300 text-white/90 hover:text-white"
            >
              <FaShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                3
              </span>
            </motion.button>

            {/* User Section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-xl glass hover:glass-accent transition-all duration-300"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-amber-300/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {getUserAvatar()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-white font-medium text-sm">{getUserDisplayName()}</p>
                    {isAdmin && (
                      <p className="text-amber-200 text-xs flex items-center">
                        <HiSparkles className="w-3 h-3 mr-1" />
                        Admin
                      </p>
                    )}
                  </div>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 glass-honey rounded-2xl shadow-xl border border-amber-200/30 overflow-hidden"
                    >
                      <div className="p-4 border-b border-amber-200/20">
                        <p className="text-white font-semibold">{getUserDisplayName()}</p>
                        <p className="text-amber-100/80 text-sm">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium mt-2">
                            <HiSparkles className="w-3 h-3 mr-1" />
                            Administrator
                          </span>
                        )}
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => { handleUserClick(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <FaRegUser className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        
                        {isAdmin && (
                          <button
                            onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                            className="w-full px-4 py-3 text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <FaCog className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </button>
                        )}
                        
                        <hr className="my-2 border-amber-200/20" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white/90 hover:text-white font-medium transition-colors duration-300"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-xl glass hover:glass-accent transition-all duration-300 text-white"
            >
              {menuOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-16 lg:top-20 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMenu} />
            
            <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] glass-honey border-l border-amber-200/30">
              <div className="flex flex-col h-full">
                
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-amber-200/20">
                  <div className="flex items-center space-x-3">
                    <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full" />
                    <div>
                      <h2 className="text-white font-bold text-lg">Laxmi Honey</h2>
                      <p className="text-amber-100/80 text-sm">Pure & Natural</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 px-6 py-6 space-y-2">
                  {NavbarMenu.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.link}
                        onClick={closeMenu}
                        className="flex items-center space-x-4 p-4 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                      >
                        <span className="font-medium text-lg">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile User Section */}
                <div className="p-6 border-t border-amber-200/20">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 rounded-xl glass">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                            {getUserAvatar()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{getUserDisplayName()}</p>
                          {isAdmin && (
                            <p className="text-amber-200 text-sm flex items-center">
                              <HiSparkles className="w-3 h-3 mr-1" />
                              Admin
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => { handleUserClick(); closeMenu(); }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <FaRegUser className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        
                        {isAdmin && (
                          <button
                            onClick={() => { navigate('/admin'); closeMenu(); }}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                          >
                            <FaCog className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </button>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to="/login"
                          onClick={closeMenu}
                          className="block w-full p-4 text-center glass rounded-xl text-white font-medium hover:glass-accent transition-all duration-300"
                        >
                          Login
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to="/signup"
                          onClick={closeMenu}
                          className="block w-full p-4 text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300"
                        >
                          Sign Up
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;