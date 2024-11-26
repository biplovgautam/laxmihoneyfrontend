import React from "react";
<<<<<<< HEAD
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
=======
import Hero from "./components/Hero";
import Products from "./components/Products/Products";
import Banner from "./components/Banner/Banner";
import BannerText from "./components/Banner/BannerText";
import Blogs from "./components/Blogs/Blogs";
import FAQ from "./components/FAQ/FAQ";
import Footer from "./components/Footer/Footer";

const App = () => {
  return (
    <main className="overflow-x-hidden relative">
      
        <Hero/>
        <Products />
        <Banner />
        <BannerText />
        <Blogs />
        <FAQ />
        <Footer />
    </main>
  );
};

export default App;
>>>>>>> origin/main
