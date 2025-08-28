import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import signupPoster from '../../assets/signupposter.png';

const SignupOld = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', formData);
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${signupPoster})` }}
    >
      <div className="glass-honey rounded-2xl shadow-lg max-w-3xl p-5 items-center flex border border-white/30 backdrop-blur-lg">
        {/* Image */}
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl"
            src={signupPoster}
            alt="Signup"
          />
        </div>
        {/* Form */}
        <div className="md:w-1/2 px-8 md:px-16">
          <h2 className="font-bold text-2xl text-[#bc7b13]">Sign Up</h2>
          <p className="text-xs mt-4 text-gray-700">
            Create an account to get started!
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              className="p-2 mt-8 rounded-xl border border-gray-300"
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="p-2 rounded-xl border border-gray-300"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              className="p-2 rounded-xl border border-gray-300"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              className="p-2 rounded-xl border border-gray-300"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button className="bg-[#f37623] rounded-xl text-white py-2 hover:bg-[#bc7b13] transition-colors duration-300">
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-gray-700">
            Already have an account? <Link to="/login" className="text-[#f37623] hover:underline duration-300">Log In</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignupOld;
