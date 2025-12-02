import React, { useState, useEffect, useCallback } from 'react';
import loginposter from '@assets/loginposter2.png';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { LottieLoader } from '../LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

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
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Image/Branding */}
        <div className="hidden md:flex flex-col justify-center items-center space-y-6 p-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-3xl opacity-20"></div>
            <img
              src={loginposter}
              alt="Laxmi Honey"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Pure honey, pure trust
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-gray-500 text-sm">Access your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                  required
                />
                {checkingEmail && (
                  <div className="absolute right-4 top-11">
                    <LottieLoader size="small" showText={false} className="w-5 h-5" />
                  </div>
                )}
                {emailExists === false && email.includes('@') && (
                  <div className="absolute right-4 top-11 flex items-center">
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">Not found</span>
                  </div>
                )}
                {emailExists === true && email.includes('@') && (
                  <div className="absolute right-4 top-11">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LottieLoader size="small" showText={false} className="w-5 h-5 mr-2" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <FcGoogle className="text-2xl" />
              <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;