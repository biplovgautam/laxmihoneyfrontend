import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import ChatbotWidget from "./components/ChatbotWidget";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetail from "./Pages/ProductDetail";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Blogs from "./Pages/Blogs";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Account from "./Pages/Account";
import Cart from "./Pages/Cart";
import AdminPanel from "./components/AdminPanel";
import NotFound from "./Pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ProfileCompletionModal from "./components/ProfileCompletionModal";

const AppContent = () => {
  const { needsPhoneNumber, setNeedsPhoneNumber, needsProfileCompletion, skipProfileCompletion, loading } = useAuth();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  
  // Define valid routes
  const validRoutes = ['/', '/login', '/signup', '/products', '/contact', '/about', '/blogs', '/cart', '/account', '/admin'];
  
  // Check if current path is a valid route or starts with /product/ (for product detail pages)
  const isValidRoute = validRoutes.includes(location.pathname) || location.pathname.startsWith('/product/');
  
  // Don't show navbar on login/signup pages, admin page, and 404 page
  const hideNavbar = ['/login', '/signup', '/admin'].includes(location.pathname) || !isValidRoute;

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    setAppReady(true);
  };

  // Show splash screen for first-time visitors or when auth is loading
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedLaxmiHoney');
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    const now = Date.now();
    
    // Show splash if:
    // 1. First-time visitor
    // 2. New session (session storage cleared)
    // 3. Auth is still loading
    if (!hasVisited || !sessionStartTime || loading) {
      if (!sessionStartTime) {
        sessionStorage.setItem('sessionStartTime', now.toString());
      }
      
      // Mark as visited after splash screen
      setTimeout(() => {
        localStorage.setItem('hasVisitedLaxmiHoney', 'true');
      }, 3000);
    } else {
      // If user has visited before and auth is not loading, skip splash
      setShowSplash(false);
      setAppReady(true);
    }
  }, [loading]);

  // Show splash screen during initial load
  if (showSplash || !appReady) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="overflow-x-hidden min-h-screen relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Modals - Only show ProfileCompletionModal (handles both phone and address) */}
        <ProfileCompletionModal 
          isOpen={needsProfileCompletion || needsPhoneNumber}
          onClose={() => skipProfileCompletion()} // Allow closing by skipping profile completion
        />
      </main>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;