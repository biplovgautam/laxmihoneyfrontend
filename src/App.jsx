import React from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";

// Pages (Create these components if they don't exist yet)
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Blogs from "./Pages/Blogs";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/Not_found";

const App = () => {
  return (
      <main className="overflow-x-hidden relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<About />} />
          <Route path="/blogs" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="*" element={<NotFound/>}/>
        </Routes>
        <Footer />
      </main>
  );
};

export default App;
