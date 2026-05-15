import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { LottieLoader } from '../LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import signupPoster from '../../assets/loginposter2.png';
import EmailExistsModal from '../EmailExistsModal';
import Toast from '../Toast';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 10 digits after stripping non-digits — matches modal's validation.
const isValidPhone = (raw) => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length >= 10;
};

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-lime-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];
  return { score, ...map[score] };
};

const Signup = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle, checkEmailExists } = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [stepError, setStepError] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const debounceEmailCheck = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (value && emailRegex.test(value)) {
            setCheckingEmail(true);
            try {
              const exists = await checkEmailExists(value);
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

  const handleNextStep = () => {
    setStepError('');
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setStepError('Please enter your first and last name.');
        return;
      }
    }
    if (step === 2) {
      if (!emailRegex.test(email)) {
        setStepError('Please enter a valid email address.');
        return;
      }
      if (emailExists === true) {
        setShowEmailExistsModal(true);
        return;
      }
      if (checkingEmail) {
        setStepError('Verifying email, please wait...');
        return;
      }
      if (!isValidPhone(phoneNumber)) {
        setStepError('Please enter a valid phone number (at least 10 digits).');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStepError('');
    setStep(step - 1);
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStepError('');

    if (emailExists === true) {
      setShowEmailExistsModal(true);
      return;
    }
    if (password.length < 6) {
      setStepError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStepError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await register({
        email: email.trim(),
        password,
        fullName,
        phoneNumber: phoneNumber.trim(),
      });

      if (result.success) {
        showToast('success', 'Account created! Welcome to Laxmi Honey 🍯');
        setTimeout(() => navigate('/'), 800);
      } else {
        setStepError(result.error || 'Signup failed. Please try again.');
        if (result.error && result.error.toLowerCase().includes('already exists')) {
          setShowEmailExistsModal(true);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStepError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setStepError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (result.redirecting) return;
        showToast('success', 'Welcome to Laxmi Honey 🍯');
        setTimeout(() => navigate('/'), 800);
      } else if (!result.cancelled) {
        setStepError(result.error || 'Google sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setStepError('Google sign up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const busy = loading || googleLoading;

  // Helper to render the form step body
  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              autoComplete="family-name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-amber-500/30"
          >
            Continue
          </button>
        </div>
      );
    }

    if (step === 2) {
      const emailValid = emailRegex.test(email);
      const phoneValid = isValidPhone(phoneNumber);
      const canProceed = emailValid && phoneValid && emailExists !== true && !checkingEmail;
      return (
        <div className="space-y-5 animate-fadeIn">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
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
            {!checkingEmail && emailExists === true && emailValid && (
              <div className="absolute right-3 top-11 flex items-center">
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md font-medium">Already taken</span>
              </div>
            )}
            {!checkingEmail && emailExists === false && emailValid && (
              <div className="absolute right-4 top-11">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              placeholder="+977 98XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canProceed}
              className="w-2/3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    // step 3
    const passwordsMatch = password && confirmPassword && password === confirmPassword;
    const canSubmit = password.length >= 6 && passwordsMatch && !busy;
    return (
      <div className="space-y-5 animate-fadeIn">
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-11 text-gray-400 hover:text-amber-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>

          {/* Password strength meter */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength.score ? strength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-xs text-gray-500">
                  Password strength: <span className="font-semibold text-gray-700">{strength.label}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:bg-white focus:ring-2 outline-none transition-all duration-300 ${
              confirmPassword && password !== confirmPassword
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 focus:border-amber-500 focus:ring-amber-200'
            }`}
            required
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-11 text-gray-400 hover:text-amber-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showConfirmPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-2/3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <LottieLoader size="small" showText={false} className="w-5 h-5 mr-2" />
                Creating...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>

      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        duration={3000}
      />

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">

        {/* Left Side - Image/Branding */}
        <div className="hidden md:flex flex-col justify-center items-center space-y-6 p-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-3xl opacity-30"></div>
            <img
              src={signupPoster}
              alt="Laxmi Honey"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Join Our Family
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Experience the sweetness of nature 🍯
            </p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/40 ring-1 ring-amber-100/50">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-500 text-sm">Sign up to get started with Laxmi Honey.</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                {[
                  { n: 1, label: 'Name' },
                  { n: 2, label: 'Contact' },
                  { n: 3, label: 'Security' },
                ].map((s, idx) => (
                  <React.Fragment key={s.n}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          step >= s.n
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step > s.n ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s.n
                        )}
                      </div>
                      <span className={`text-xs font-medium ${step >= s.n ? 'text-amber-600' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`w-10 h-1 rounded -mt-5 transition-all duration-300 ${
                        step > s.n ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {stepError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fadeIn">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{stepError}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {renderStep()}
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={busy}
              className="w-full bg-white border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {googleLoading ? (
                <>
                  <LottieLoader size="small" showText={false} className="w-5 h-5" />
                  <span>Signing up...</span>
                </>
              ) : (
                <>
                  <FcGoogle className="text-2xl" />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="mt-8 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
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
