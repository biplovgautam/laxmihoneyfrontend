import React from 'react';
import { motion } from 'framer-motion';
import { GiHoneypot, GiBee } from 'react-icons/gi';
import { FaLeaf, FaAward, FaHeart, FaUsers, FaLinkedin } from 'react-icons/fa';
import galleryImage from '../assets/gallery/SAM_1380.JPG';

const About = () => {
  const values = [
    {
      icon: <GiHoneypot className="w-8 h-8" />,
      title: "Pure Quality",
      description: "100% natural honey with no additives or preservatives"
    },
    {
      icon: <FaLeaf className="w-8 h-8" />,
      title: "Sustainable",
      description: "Eco-friendly beekeeping practices that protect nature"
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "Passionate",
      description: "Three generations of dedication to beekeeping excellence"
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Community",
      description: "Supporting local bee farmers and fair trade practices"
    }
  ];

  const teamMembers = [
    {
      name: "Laxmi Dhakal",
      role: "CEO & Founder",
      linkedin: "https://www.linkedin.com/in/laxmidhakalgautam/",
      description: "Visionary leader with a passion for sustainable beekeeping"
    },
    {
      name: "Biplov Gautam",
      role: "CTO & Managing Director",
      email: "cto@laxmibeekeeping.com.np",
      linkedin: "https://www.linkedin.com/in/biplovgautam/",
      description: "Technology expert driving innovation in honey production"
    },
    {
      name: "Bipin Gautam",
      role: "Operations Manager",
      linkedin: "https://www.linkedin.com/company/105054989/",
      description: "Ensuring smooth operations and quality control"
    },
    {
      name: "Om Prakash Gautam",
      role: "Production Manager",
      linkedin: "https://www.linkedin.com/company/105054989/",
      description: "Expert in traditional beekeeping methods"
    },
    {
      name: "Barsha Gautam",
      role: "Quality Assurance",
      linkedin: "https://www.linkedin.com/company/105054989/",
      description: "Maintaining the highest quality standards"
    }
  ];

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={galleryImage} 
            alt="Laxmi Honey Beekeeping" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-800/85 to-amber-900/80"></div>
        </div>
        
        <div className="container-modern pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-4"
            >
              <GiBee className="w-4 h-4" />
              <span>Since 2008</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl"
            >
              About Laxmi Honey Industry
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl leading-relaxed text-white/95 max-w-3xl mx-auto drop-shadow-lg"
            >
              From the pristine valleys of Nepal to your table, we bring you the purest honey 
              harvested with love and traditional wisdom passed down through generations.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-modern">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-amber-600 font-semibold">
                <div className="h-[2px] w-8 bg-amber-600"></div>
                <span>OUR JOURNEY</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Three Generations of <span className="text-amber-600">Beekeeping Excellence</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Nestled in the heart of Nepal's countryside, our family has been dedicated to 
                sustainable beekeeping for over three generations. What started as a small 
                village initiative has grown into a trusted source of pure, organic honey.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                We work closely with local bee farmers, ensuring fair trade practices while 
                maintaining the highest quality standards. Every jar of our honey tells a 
                story of tradition, purity, and the natural sweetness of Nepal.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <FaAward className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Why Choose Us</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 leading-relaxed">100% Pure & Natural honey with no additives</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 leading-relaxed">Sustainable & Ethical beekeeping practices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 leading-relaxed">Direct from Himalayan foothills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 leading-relaxed">Rich in antioxidants & natural enzymes</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Our Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 text-amber-600 font-semibold mb-4">
              <div className="h-[2px] w-8 bg-amber-600"></div>
              <span>MEET OUR TEAM</span>
              <div className="h-[2px] w-8 bg-amber-600"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              The People Behind <span className="text-amber-600">Laxmi Honey</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Dedicated professionals committed to bringing you the finest honey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-100">
                  {/* Image Placeholder */}
                  <div className="relative h-72 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/50">
                        <FaUsers className="w-16 h-16 text-amber-600/70" />
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-amber-600 font-semibold mb-3">
                      {member.role}
                    </p>
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-sm text-gray-500 hover:text-amber-600 transition-colors block mb-3"
                      >
                        {member.email}
                      </a>
                    )}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {member.description}
                    </p>

                    {/* LinkedIn Button */}
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all duration-300 text-sm font-medium group-hover:shadow-lg"
                    >
                      <FaLinkedin className="w-4 h-4" />
                      <span>Connect on LinkedIn</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <GiHoneypot className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-white/95 leading-relaxed">
              To provide families across Nepal and beyond with the purest, most nutritious honey 
              while supporting sustainable beekeeping practices and protecting our precious bee populations. 
              Every jar we produce is a testament to our commitment to quality, tradition, and environmental stewardship.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;