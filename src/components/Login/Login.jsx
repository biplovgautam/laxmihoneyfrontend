import React, { useState, useEffect, useCallback } from 'react';
import loginposter from '@assets/loginposter2.png';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PhoneNumberModal from '../PhoneNumberModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const navigate = useNavigate();
  const { login, signInWithGoogle, checkEmailExists, needsPhoneNumber } = useAuth();

  // Debounced email checking
  const debounceEmailCheck = useCallback(
    (() => {
      let timeoutId;
      return (email) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (email && email.includes('@')) {
            setCheckingEmail(true);
            try {
              const exists = await checkEmailExists(email);
              setEmailExists(exists);
            } catch (error) {
              console.error('Error checking email:', error);
              setEmailExists(null);
            } finally {
              setCheckingEmail(false);
            }
          } else {
            setEmailExists(null);
          }
        }, 500);
      };
    })(),
    [checkEmailExists]
  );

  useEffect(() => {
    debounceEmailCheck(email);
  }, [email, debounceEmailCheck]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Invalid credentials, please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Google sign in failed. Please try again.');
      }
    } catch (error) {
      setError('Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <br/>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="relative">
              <input
                className="p-2 rounded-xl border border-gray-300 w-full outline-none hover:scale-[1.02] transition-all duration-300 focus:border-gray-600 focus:scale-[1.03]"
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {checkingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {emailExists === false && email.includes('@') && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                  <span className="text-xs">Account not found</span>
                </div>
              )}
              {emailExists === true && email.includes('@') && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </div>
              )}
            </div>
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
              type="submit"
              className="bg-customorangedark rounded-xl text-white py-2 hover:scale-[1.03] duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-white border py-2 w-[80%] rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-[1.03] duration-300 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
          <FcGoogle className="mr-3 text-xl" />
            {loading ? 'Signing in...' : 'Login with Google'}
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
      
      {/* Phone Number Modal for Google users */}
      <PhoneNumberModal 
        isOpen={needsPhoneNumber} 
        onClose={() => {}} // Can't close until phone number is provided
      />
    </section>
  );
};

export default Login;