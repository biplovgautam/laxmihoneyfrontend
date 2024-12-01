import React from 'react';

const Bee = () => {
  return (
    <div className="relative w-full h-screen flex justify-center items-center ">
      <div className=" w-12 h-12 bg-yellow-400 rounded-full animate-buzzingBee">
        {/* You can add a bee icon here */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-black rounded-full"></div>
        <div className="absolute top-0 left-3 w-3 h-3 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default Bee;