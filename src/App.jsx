import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Blogs from "./Pages/Blogs";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Account from "./Pages/Account";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <main className="overflow-x-hidden min-h-screen relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/products" element={<><Navbar /><Products /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /></>} />
          <Route path="/about" element={<><Navbar /><About /></>} />
          <Route path="/blogs" element={<><Navbar /><Blogs /></>} />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Navbar />
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<><Navbar /><div className="p-8 text-center">404 - Page Not Found</div></>} />
        </Routes>
      </main>
    </AuthProvider>
  );
};export default App;