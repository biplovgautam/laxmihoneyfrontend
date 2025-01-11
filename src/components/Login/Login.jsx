import React, { useState } from 'react';
import loginposter from '@assets/loginposter2.png';
import { FcGoogle } from 'react-icons/fc';

import { Link, useNavigate } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login/`, {
        email,
        password,
      });
      console.log('Login successful', response.data);
      localStorage.setItem('token', response.data.access); // Store the token in localStorage
      navigate('/');
    } catch (error) {
      setError('Invalid credentials, please try again!');
    } finally {
      setLoading(false);
    }
  };


  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${loginposter})` }}
    >
        {/* Login container */}
      <div className="bg-customorangelight bg-opacity-10 backdrop-blur-lg flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">
        {/* Form */}
        <div className="md:w-1/2 px-8 md:px-16">
          <h2 className="font-bold text-2xl text-black">Login</h2>
          <p className="text-xs mt-4 text-black">
            Login into your account!
          </p>

          <form className="flex flex-col gap-4">
            <br/>
            <input
              className="p-2 rounded-xl border border-gray-300 outline-none hover:scale-[1.02] transition-all duration-300 focus:border-gray-600 focus:scale-[1.03]"
              type="email"
              name="email"
              placeholder="Email"
            />
            <div className="relative">
            <input
              className="p-2 rounded-xl border border-gray-300 w-full outline-none hover:scale-[1.02] transition-all duration-300 focus:border-gray-600 focus:scale-[1.03]"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            
            <Link to="/forgot-password" className="text-xs ml-2 w-[50%] mt-4 text-black hover:underline  transition-all duration-300">
              Forgot Password?
            </Link>
            <button
              className="bg-customorangedark rounded-xl text-white py-2 hover:scale-[1.03] duration-300"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 items-center text-black-400">
            <hr className="border-black" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-black" />
          </div>
          <div className='flex justify-center'>
          <button className="bg-white border py-2 w-[80%] rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-[1.03] duration-300 text-black">
          <FcGoogle className="mr-3 text-xl" />

            Login with Google
          </button>
          </div>

          <p className="mt-4 ml-[-1rem] text-center text-black">
            Don't have an Account? <Link to="/signup" className="text-black ml-4 hover:underline">Sign Up</Link>
          </p>
        </div>

        {/* Image */}
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl"
            src={loginposter}
            alt="Signup"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;