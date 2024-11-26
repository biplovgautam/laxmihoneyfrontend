import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";

const App = () => {
  return (
      <main className="overflow-x-hidden relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<About />} />
          <Route path="/blogs" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </main>
  );
};

export default App;