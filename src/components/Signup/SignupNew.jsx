import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import signupPoster from '@assets/loginposter2.png';

const Signup = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle } = useAuth();
  
  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Validation state
  const [emailValidation, setEmailValidation] = useState({ checking: false, valid: false, exists: false });
  const [phoneValidation, setPhoneValidation] = useState({ checking: false, valid: false });

  // Debounce hook
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPhone = useDebounce(formData.phoneNumber, 500);

  // Email validation
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@')) {
      setEmailValidation({ checking: true, valid: false, exists: false });
      
      // Simulate email validation
      setTimeout(() => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);
        setEmailValidation({ 
          checking: false, 
          valid: isValid, 
          exists: false // This would be checked against database
        });
      }, 1000);
    }
  }, [debouncedEmail]);

  // Phone validation
  useEffect(() => {
    if (debouncedPhone && debouncedPhone.length >= 10) {
      setPhoneValidation({ checking: true, valid: false });
      
      // Simulate phone validation
      setTimeout(() => {
        const isValid = /^[0-9]{10}$/.test(debouncedPhone);
        setPhoneValidation({ checking: false, valid: isValid });
      }, 800);
    }
  }, [debouncedPhone]);

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

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailValidation.valid) {
        newErrors.email = 'Please enter a valid email';
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!phoneValidation.valid) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;
    
    setLoading(true);
    
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Google signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-8"
      style={{ backgroundImage: `url(${signupPoster})` }}
    >
      <div className="glass-honey flex rounded-3xl shadow-2xl max-w-4xl p-6 items-center border border-white/30 backdrop-blur-lg">
        {/* Form */}
        <div className="md:w-1/2 px-8 md:px-16">
          <div className="mb-6">
            <h2 className="font-bold text-3xl text-[#bc7b13]">Join Us</h2>
            <p className="text-sm mt-2 text-gray-700">
              Create your account to start your honey journey
            </p>
            
            {/* Progress Steps */}
            <div className="flex items-center mt-6 mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-[#f37623] text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#f37623]' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-[#f37623] text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <input
                      className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02]"
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email with validation */}
                  <div>
                    <div className="relative">
                      <input
                        className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02] pr-10"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailValidation.checking ? (
                          <FaSpinner className="animate-spin text-gray-400" />
                        ) : emailValidation.valid ? (
                          <FaCheck className="text-green-500" />
                        ) : null}
                      </div>
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-[#f37623] text-white py-3 rounded-xl font-semibold hover:bg-[#e06519] hover:scale-[1.02] duration-300 glass-accent"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Phone Number */}
                  <div>
                    <div className="relative">
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl">
                          🇳🇵 +977
                        </span>
                        <input
                          className="flex-1 p-3 rounded-r-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02] pr-10"
                          type="tel"
                          name="phoneNumber"
                          placeholder="9800000000"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          maxLength="10"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {phoneValidation.checking ? (
                            <FaSpinner className="animate-spin text-gray-400" />
                          ) : phoneValidation.valid ? (
                            <FaCheck className="text-green-500" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <input
                        className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02] pr-10"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
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
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <input
                        className="w-full p-3 rounded-xl border border-gray-300 glass-accent outline-none hover:scale-[1.02] transition-all duration-300 focus:border-[#f37623] focus:scale-[1.02] pr-10"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 hover:scale-[1.02] duration-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#f37623] text-white py-3 rounded-xl font-semibold hover:bg-[#e06519] hover:scale-[1.02] duration-300 glass-accent disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
          </form>

          {/* Google Signup */}
          <div className="mt-6">
            <div className="grid grid-cols-3 items-center text-gray-400 mb-4">
              <hr className="border-gray-300" />
              <p className="text-center text-sm">OR</p>
              <hr className="border-gray-300" />
            </div>
            
            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-white border border-gray-300 py-3 rounded-xl flex justify-center items-center text-sm hover:scale-[1.02] duration-300 text-gray-700 glass-accent disabled:opacity-50"
            >
              <FcGoogle className="mr-3 text-xl" />
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-gray-700">
            Already have an account? 
            <Link to="/login" className="text-[#f37623] ml-2 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        {/* Image */}
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl w-full h-full object-cover"
            src={signupPoster}
            alt="Signup"
          />
        </div>
      </div>
    </section>
  );
};

export default Signup;
