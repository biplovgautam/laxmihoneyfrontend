import React from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";

// Pages (Create these components if they don't exist yet)
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Blogs from "./Pages/Blogs";
import About from "./Pages/About";
import Contact from "./Pages/Contact";

const App = () => {
  return (
      <main className="overflow-x-hidden relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </main>
  );
};

export default App;
