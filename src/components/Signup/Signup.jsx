import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import signupPoster from '@assets/loginposter2.png';
import { FcGoogle } from 'react-icons/fc';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.REACT_APP_API_URL}/register/`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        username,
        password,
      });
      console.log('Signup successful', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Error message:', error.message);
      console.error('Full error:', error.response ? error.response.data : error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${signupPoster})` }}
    >
      <div className="bg-customorangelight bg-opacity-10 backdrop-blur-lg flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">
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
          <h2 className="font-bold text-2xl text-black">Sign Up</h2>
          <p className="text-xs mt-4 text-black">
            Create an account to get started!
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <input
                  className="p-2 mt-8 rounded-xl border"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  className="p-2 rounded-xl border"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bg-customorangedark rounded-xl text-white py-2 hover:scale-105 duration-300"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <input
                  className="p-2 mt-8 rounded-xl border"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="p-2 mt-4 rounded-xl border"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="p-2 rounded-xl border"
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bg-customorangedark rounded-xl text-white py-2 hover:scale-105 duration-300"
                  onClick={handleNextStep}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="bg-gray-500 rounded-xl text-white py-2 hover:scale-105 duration-300 mt-2"
                  onClick={handlePreviousStep}
                >
                  Previous
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <div className="relative">
                  <input
                    className="p-2 mt-8 rounded-xl border w-full"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                </div>
                <div className="relative">
                  <input
                    className="p-2 rounded-xl border w-full"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <svg
                    onClick={togglePasswordVisibility}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="gray"
                    className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                  </svg>
                </div>
                <div className='flex justify-evenly mt-4'>
                <button
                  type="button"
                  className="bg-customorangedarkopp px-4 rounded-xl text-white py-2 hover:scale-105 duration-300 mt-2"
                  onClick={handlePreviousStep}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="bg-customorangedark px-4 rounded-xl text-white py-2 hover:scale-105 duration-300"
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                
                </div>
              </>
            )}
          </form>
          <div className="mt-6 grid grid-cols-3 items-center text-black-400">
            <hr className="border-black" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-black" />
          </div>

          <div className='flex justify-center'>
          <button className="bg-white border py-2 w-[80%] rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-[1.03] duration-300 text-black">
          <FcGoogle className="mr-3 text-xl" />

            Signup with Google
          </button>
          </div>
          <p className="mt-4 ml-[-1rem] text-center text-black">
            Already have an account? <Link to="/login" className="text-black ml-4 hover:underline duration-300">Log In</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;