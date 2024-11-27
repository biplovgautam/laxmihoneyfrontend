import React, { useState } from 'react';

import BlogsComponent from "../components/Blogs/Blogs";
import Products from "../components/Products/Products";
import Banner from "../components/Banner/Banner";
import BannerText from "../components/Banner/BannerText";


const Blogs = () => {

  return (
    <>
    <BlogsComponent/>
        <Products />
        <Banner />
        <BannerText />
    </>
  );
};

export default Blogs;