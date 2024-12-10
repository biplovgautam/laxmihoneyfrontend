import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Blogs from "./Pages/Blogs";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/Not_found";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Account from "./Pages/Account";
import Bee from "./components/Bee";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <main className="overflow-x-hidden min-h-screen relative">
        <Navbar /> {/* Navbar will be fixed/sticky on top */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Suspense fallback={<Bee />}><Products /></Suspense>} />
          <Route path="/blogs" element={<Suspense fallback={<Bee />}><Blogs /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<Bee />}><About /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<Bee />}><Contact /></Suspense>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </main>
    </AuthProvider>
  );
};

export default App;