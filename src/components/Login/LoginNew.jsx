import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LottieLoader } from '../LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import loginposter from '../../assets/loginposter2.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/');
      } else {
        // Check if it's a user-not-found error and redirect to signup
        if (result.error.includes('user-not-found') || result.error.includes('invalid-credential')) {
          setErrors({ 
            submit: 'Account not found. Please sign up first.',
            redirect: true
          });
          setTimeout(() => {
            navigate('/signup');
          }, 2000);
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Google login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-8"
      style={{ backgroundImage: `url(${loginposter})` }}
    >
      <div className="glass-honey flex rounded-3xl shadow-2xl max-w-4xl p-6 items-center border border-white/30 backdrop-blur-lg">
        {/* Form */}
        <div className="md:w-1/2 px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-bold text-3xl text-[#bc7b13] mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-700 mb-8">
              Sign in to your honey paradise account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <input
                  className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02]"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <input
                    className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02] pr-10"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </motion.div>

              {/* Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-right"
              >
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#f37623] hover:underline transition-all duration-300"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#f37623] text-white py-3 rounded-xl font-semibold hover:bg-[#e06519] hover:scale-[1.02] duration-300 glass-accent disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LottieLoader size="small" showText={false} className="mr-2 w-5 h-5" />
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm text-center p-3 rounded-lg ${
                    errors.redirect 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                >
                  {errors.submit}
                  {errors.redirect && (
                    <div className="mt-1 text-xs">
                      Redirecting to signup...
                    </div>
                  )}
                </motion.div>
              )}
            </form>

            {/* Google Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6"
            >
              <div className="grid grid-cols-3 items-center text-gray-400 mb-4">
                <hr className="border-gray-300" />
                <p className="text-center text-sm">OR</p>
                <hr className="border-gray-300" />
              </div>
              
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-300 py-3 rounded-xl flex justify-center items-center text-sm hover:scale-[1.02] duration-300 text-gray-700 glass-accent disabled:opacity-50"
              >
                <FcGoogle className="mr-3 text-xl" />
                Continue with Google
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 text-center text-gray-700"
            >
              Don't have an account? 
              <Link to="/signup" className="text-[#f37623] ml-2 hover:underline font-semibold">
                Sign Up
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Image */}
        <div className="md:block hidden w-1/2">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl w-full h-full object-cover"
            src={loginposter}
            alt="Login"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
