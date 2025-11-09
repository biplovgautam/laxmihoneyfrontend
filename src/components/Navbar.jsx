import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Logo from "../assets/logo.png";
import { MdMenu, MdClose } from "react-icons/md";
import { FaRegUser, FaShoppingCart, FaCog, FaUserCircle, FaExclamationTriangle, FaHome, FaBox, FaPhone, FaInfoCircle, FaBlog } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { getCartTotal } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const cartTotal = getCartTotal();

  const NavbarMenu = useMemo(() => {
    const baseMenu = [
      { id: 1, title: "Home", link: "/", icon: FaHome },
      { id: 2, title: "Blogs", link: "/blogs", icon: FaBlog },
      { id: 3, title: "Products", link: "/products", icon: FaBox },
      { id: 4, title: "Contact", link: "/contact", icon: FaPhone },
      { id: 5, title: "About", link: "/about", icon: FaInfoCircle },
    ];

    // Add admin link for admin users
    if (user?.isAdmin) {
      baseMenu.push({ id: 6, title: "Admin", link: "/admin", icon: FaCog });
    }

    return baseMenu;
  }, [user?.isAdmin]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      // Only handle desktop user menu click outside
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

    // Body scroll lock when mobile menu is open
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      // Clean up body scroll lock
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    };
  }, [lastScrollY, menuOpen]);

  const handleUserClick = () => {
    navigate('/account');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMenuOpen(false);
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

  const isProfileIncomplete = () => {
    if (!user) return false;
    return !user.phoneNumber || !user.address || !user.city || !user.displayName;
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

    // Mobile Menu Component that will be portaled
  const MobileMenu = () => (
    <AnimatePresence mode="wait">
      {menuOpen && (
        <div className="md:hidden">
          {/* Backdrop - starts below navbar to keep navbar visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 top-[72px] z-[99998] bg-gradient-to-br from-amber-900/60 via-orange-900/50 to-amber-800/60 backdrop-blur-sm"
            onClick={closeMenu}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          />
          
          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 0.2 }
            }}
            className="fixed top-[72px] right-0 bottom-0 z-[99999] w-80 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full bg-gradient-to-b from-amber-600/95 via-orange-500/95 to-amber-500/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex flex-col h-full relative">
                
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
                </div>

                {/* User Profile Section - when logged in */}
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-10 p-6 border-b border-white/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover ring-3 ring-white/30 shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl ring-3 ring-white/30 shadow-lg">
                            {getUserAvatar()}
                          </div>
                        )}
                        {isProfileIncomplete() && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                            <FaExclamationTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg drop-shadow-md">{getUserDisplayName()}</p>
                        <p className="text-white/80 text-sm drop-shadow-sm">{user.email}</p>
                        {isAdmin && (
                          <div className="flex items-center mt-2">
                            <HiSparkles className="w-4 h-4 text-amber-200 mr-1" />
                            <span className="text-amber-200 text-xs font-medium drop-shadow-sm">Administrator</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile Actions - Split Layout */}
                    <div className="mt-4 flex gap-3">
                      {/* Profile Button (Left) */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { handleUserClick(); closeMenu(); }}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 shadow-lg"
                      >
                        <FaUserCircle className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </motion.button>
                      
                      {/* Logout Button (Right) */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white transition-all duration-300 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </motion.button>
                    </div>
                    
                    {/* Admin Panel Button (Full Width) */}
                    {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { navigate('/admin'); closeMenu(); }}
                        className="w-full mt-3 flex items-center justify-center space-x-2 py-3 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 backdrop-blur-sm border border-amber-300/30 text-white transition-all duration-300 shadow-lg"
                      >
                        <FaCog className="w-5 h-5" />
                        <span className="font-medium">Admin Panel</span>
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* Mobile Navigation Links */}
                <div className="flex-1 relative z-10 px-6 py-4 space-y-1 overflow-y-auto">
                  {NavbarMenu.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + (index * 0.05) }}
                    >
                      <Link
                        to={item.link}
                        onClick={closeMenu}
                        className="flex items-center space-x-4 p-4 rounded-2xl text-white/90 hover:text-white transition-all duration-300 group hover:bg-white/10 active:bg-white/20"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-lg flex-1 drop-shadow-sm">{item.title}</span>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Auth buttons for non-logged users */}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + (NavbarMenu.length * 0.05) }}
                      className="pt-4 border-t border-white/20 mt-4 space-y-3"
                    >
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="flex items-center space-x-4 p-4 rounded-2xl text-white/90 hover:text-white transition-all duration-300 group hover:bg-white/10 active:bg-white/20"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                          <FaRegUser className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-lg flex-1 drop-shadow-sm">Login</span>
                      </Link>
                      
                      <Link
                        to="/signup"
                        onClick={closeMenu}
                        className="flex items-center space-x-4 p-4 rounded-2xl text-white transition-all duration-300 group bg-gradient-to-r from-amber-400/30 to-orange-400/30 hover:from-amber-400/40 hover:to-orange-400/40 border border-amber-300/30 shadow-lg"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-300">
                          <HiSparkles className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-lg flex-1 drop-shadow-sm">Sign Up</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: 1,
          y: isVisible ? 0 : -100 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed w-full top-0 z-[9999] transition-all duration-300 ${
          lastScrollY > 50 
            ? "glass-honey shadow-xl border-b border-amber-200/30 backdrop-blur-xl" 
            : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm"
        }`}
        style={{ minHeight: '56px' }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <motion.div 
              className="flex items-center space-x-3 flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img
                    src={Logo}
                    alt="Laxmi Honey"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-300/50 group-hover:ring-amber-400/70 transition-all duration-300 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white drop-shadow-lg">
                    Laxmi Honey
                  </h1>
                  <p className="text-xs text-amber-100/80 drop-shadow-sm">Pure & Natural</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {NavbarMenu.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.link}
                    className="relative px-4 py-2 rounded-xl text-white/90 hover:text-white font-medium transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 backdrop-blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
                    <span className="relative z-10 drop-shadow-sm">{item.title}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Section - User & Actions */}
            <div className="flex items-center space-x-3">
              
              {/* Cart Icon */}
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/10 hover:border-amber-300/40 transition-all duration-300 text-white shadow-lg hover:shadow-xl"
                onClick={() => navigate('/cart')}
              >
                <FaShoppingCart className="w-5 h-5" />
                {cartTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse-soft">
                    {cartTotal > 99 ? '99+' : cartTotal}
                  </span>
                )}
              </motion.button>

              {/* Desktop User Section */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/10 hover:border-amber-300/40 transition-all duration-300 shadow-lg relative"
                  >
                    <div className="relative">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-amber-300/70 ring-1 ring-white/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/20">
                          {getUserAvatar()}
                        </div>
                      )}
                      {/* Warning icon for incomplete profile */}
                      {isProfileIncomplete() && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaExclamationTriangle className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-white font-semibold text-sm drop-shadow-md">{getUserDisplayName()}</p>
                      {isAdmin && (
                        <p className="text-amber-200 text-xs flex items-center drop-shadow-sm">
                          <HiSparkles className="w-3 h-3 mr-1" />
                          Admin
                        </p>
                      )}
                    </div>
                  </motion.button>

                  {/* Desktop User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-600/30 to-orange-600/30">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt="Profile"
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-300/50"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-amber-300/50">
                                  {getUserAvatar()}
                                </div>
                              )}
                              {isProfileIncomplete() && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                  <FaExclamationTriangle className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{getUserDisplayName()}</p>
                              <p className="text-amber-100/80 text-xs truncate">{user.email}</p>
                              {isAdmin && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium mt-1">
                                  <HiSparkles className="w-3 h-3 mr-1" />
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleUserClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                          >
                            <FaUserCircle className="w-5 h-5" />
                            <span>My Profile</span>
                          </motion.button>
                          
                          {isAdmin && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                            >
                              <FaCog className="w-5 h-5" />
                              <span>Admin Panel</span>
                            </motion.button>
                          )}
                          
                          <div className="border-t border-white/10 my-2" />
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-200 hover:text-red-100 hover:bg-red-500/20 transition-all duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-300 hover:bg-white/10 rounded-xl backdrop-blur-sm"
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

              {/* Mobile Menu Button / Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className="md:hidden relative p-3 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/10 hover:border-amber-300/40 transition-all duration-300 text-white shadow-lg group overflow-hidden"
              >
                {/* Button background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                {/* Dynamic Icon/Profile Content */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {menuOpen ? (
                    // Always show close button when menu is open
                    <motion.div
                      animate={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MdClose className="w-6 h-6" />
                    </motion.div>
                  ) : user ? (
                    // Show user profile when logged in and menu closed
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover border border-amber-300/50"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                          {getUserAvatar()}
                        </div>
                      )}
                      {/* Profile indicator dot */}
                      {isProfileIncomplete() && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <FaExclamationTriangle className="w-1.5 h-1.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    // Show hamburger when not logged in and menu closed
                    <motion.div
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MdMenu className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>
                
                {/* Menu indicator dot - only show for non-logged users when menu closed */}
                {!menuOpen && !user && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg animate-pulse" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Portal the mobile menu to document.body to avoid parent container constraints */}
      {typeof window !== 'undefined' && createPortal(<MobileMenu />, document.body)}
    </>
  );
};

export default Navbar;
