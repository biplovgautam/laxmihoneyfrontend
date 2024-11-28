import React from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar.jsx";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Blogs from "./Pages/Blogs";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/Not_found";

const App = () => {
  return (
    <main className="overflow-x-hidden min-h-screen relative">
      <Navbar /> {/* Navbar will be fixed/sticky on top */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </main>
  );
};

export default App;