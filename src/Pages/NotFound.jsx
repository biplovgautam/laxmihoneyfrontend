import React from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '../assets/logo.png';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex flex-col">
      {/* Logo Header */}
      <div className="p-4 sm:p-6">
        <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
          <img 
            src={logo} 
            alt="Laxmi Honey Logo" 
            className="h-12 sm:h-16 md:h-20 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-16">
        {/* Lottie Animation */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
          <DotLottieReact
            src="https://lottie.host/0364f39b-a208-46e0-945b-a8bb7cd4c054/MgY5I15mpb.lottie"
            loop
            autoplay
          />
        </div>

        {/* Text Content */}
        <div className="text-center mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto px-4">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Home Button */}
        <Link
          to="/"
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg inline-flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 sm:h-6 sm:w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Footer Space */}
      <div className="h-8 sm:h-12"></div>
    </div>
  );
};

export default NotFound;
