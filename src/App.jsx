import React from "react";
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
