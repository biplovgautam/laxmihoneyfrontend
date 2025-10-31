import React from "react";
import Hero from "../components/Hero";
import HoneyBenefits from "../components/HoneyBenefits";

const Home = () => {
  return (
    <div className="bg-[#fffef8] min-h-screen">
      <Hero />
      <HoneyBenefits />
    </div>
  );
};

export default Home;