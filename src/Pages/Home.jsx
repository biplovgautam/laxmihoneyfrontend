import React from "react";
import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import HoneyBenefits from "../components/HoneyBenefits";
import TrustSection from "../components/TrustSection";
import CTASection from "../components/CTASection";

const Home = () => {
  return (
    <div className="bg-[#fffef8]">
      {/* 1. Hero - Grab attention with featured products */}
      <Hero />
      
      {/* 2. Why Choose Us - Build trust immediately */}
      <WhyChooseUs />
      
      {/* 3. Honey Benefits - Educate with video background */}
      <HoneyBenefits />
      
      {/* 4. Social Proof - Show customer satisfaction */}
      <TrustSection />
      
      {/* 5. Call to Action - Convert visitors */}
      <CTASection />
    </div>
  );
};

export default Home;