import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Blogs from "./Pages/Blogs";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Account from "./Pages/Account";
import Cart from "./Pages/Cart";
import AdminPanel from "./components/AdminPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ProfileCompletionModal from "./components/ProfileCompletionModal";

const AppContent = () => {
  const { needsPhoneNumber, setNeedsPhoneNumber, needsProfileCompletion, skipProfileCompletion } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on login/signup pages and admin page
  const hideNavbar = ['/login', '/signup', '/admin'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="overflow-x-hidden min-h-screen relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
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
          <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
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