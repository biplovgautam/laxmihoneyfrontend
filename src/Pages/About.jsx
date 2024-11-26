import React, { useState } from 'react';

import Hero from "../components/Hero";
import Products from "../components/Products/Products";
import Banner from "../components/Banner/Banner";
import BannerText from "../components/Banner/BannerText";


const About = () => {

  return (
    <>
    <Hero/>
        <Products />
        <Banner />
        <BannerText />
    </>
  );
};

export default About;