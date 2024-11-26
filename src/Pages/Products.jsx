import React, { useState } from 'react';

import Hero from "../components/Hero";
//import Products from "../components/Products/Products";
import Banner from "../components/Banner/Banner";
import BannerText from "../components/Banner/BannerText";


const Product = () => {

  return (
    <>
    <Hero/>
        <Banner />
        <BannerText />
    </>
  );
};

export default Product;