import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { LottieLoader } from '../LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import signupPoster from '../../assets/loginposter2.png';
import EmailExistsModal from '../EmailExistsModal';

const Signup = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle, checkEmailExists, needsPhoneNumber } = useAuth();
  
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

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
              if (exists) {
                setShowEmailExistsModal(true);
              }
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
    
    // Check if email already exists
    if (emailExists) {
      setShowEmailExistsModal(true);
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const fullName = `${firstName} ${lastName}`;
      const result = await register({
        email,
        password,
        fullName,
        phoneNumber
      });
      
      if (result.success) {
        console.log('Signup successful');
        // Show success message and redirect
        alert('Account created successfully! Welcome to Laxmi Honey Industry!');
        navigate('/');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error message:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      alert('Welcome to Laxmi Honey Industry!');
      navigate('/');
    } catch (error) {
      console.error('Google signup error:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
            {step === 1 && (
              <>
                <input
                  className="p-2 mt-8 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  className="p-2 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bg-[#f37623] rounded-xl text-white py-2 hover:bg-[#bc7b13] hover:scale-105 duration-300 transition-all"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <div className="relative">
                  <input
                    className="p-2 mt-8 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors w-full"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {checkingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <LottieLoader size="small" showText={false} className="w-4 h-4" />
                    </div>
                  )}
                  {emailExists === true && email.includes('@') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <span className="text-xs">Email taken</span>
                    </div>
                  )}
                  {emailExists === false && email.includes('@') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                <input
                  className="p-2 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors"
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bg-[#f37623] rounded-xl text-white py-2 hover:bg-[#bc7b13] hover:scale-105 duration-300 transition-all"
                  onClick={handleNextStep}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="bg-gray-500 rounded-xl text-white py-2 hover:bg-gray-600 hover:scale-105 duration-300 transition-all mt-2"
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
                    className="p-2 mt-8 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors w-full"
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
                    className="p-2 rounded-xl border border-gray-300 focus:border-[#f37623] focus:outline-none transition-colors w-full"
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
                    className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer hover:fill-[#f37623] transition-colors"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                  </svg>
                </div>
                <div className='flex justify-evenly mt-4'>
                  <button
                    type="button"
                    className="bg-gray-500 px-4 rounded-xl text-white py-2 hover:bg-gray-600 hover:scale-105 duration-300 transition-all mt-2"
                    onClick={handlePreviousStep}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#f37623] px-4 rounded-xl text-white py-2 hover:bg-[#bc7b13] hover:scale-105 duration-300 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <LottieLoader size="small" showText={false} className="mr-2 w-5 h-5" />
                        Creating Account...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
          <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
            <hr className="border-gray-300" />
            <p className="text-center text-sm text-gray-600">OR</p>
            <hr className="border-gray-300" />
          </div>

          <div className='flex justify-center'>
            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="bg-white border border-gray-300 py-2 w-[80%] rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-[1.03] hover:shadow-lg duration-300 text-gray-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LottieLoader size="small" showText={false} className="mr-3 w-5 h-5" />
                  Creating Account...
                </div>
              ) : (
                <>
                  <FcGoogle className="mr-3 text-xl" />
                  Signup with Google
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-center text-gray-700">
            Already have an account? <Link to="/login" className="text-[#f37623] hover:underline duration-300">Log In</Link>
          </p>
        </div>
      </div>
      
      {/* Email Exists Modal */}
      <EmailExistsModal 
        isOpen={showEmailExistsModal}
        onClose={() => setShowEmailExistsModal(false)}
        email={email}
      />
    </section>
  );
};

export default Signup;