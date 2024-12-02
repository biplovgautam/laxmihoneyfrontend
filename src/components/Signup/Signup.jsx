import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+977');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValid, setIsValid] = useState({
    username: true,
    email: true,
    phoneNumber: true,
    password: true,
    confirmPassword: true,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password and confirm password
    const isPasswordValid = password.length >= 6;
    const isConfirmPasswordValid = confirmPassword.length >= 6 && password === confirmPassword;
    const isUsernameValid = username.trim() !== '' && !username.includes(' ');
  
    setIsValid({
      ...isValid,
      password: isPasswordValid,
      confirmPassword: isConfirmPasswordValid,
      username: isUsernameValid,
    });
  
    // Prevent form submission if there are validation errors
    if (!isPasswordValid || !isConfirmPasswordValid || !isUsernameValid) {
      return;
    }
  
    // Log the data to the console before sending to the API
    console.log('Form Data:', {
      username,
      email,
      phone_number: `${countryCode}${phoneNumber}`,
      password,
    });
  
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/register/', {
          username,
          email,
          phone_number: `${countryCode}${phoneNumber}`,
          password,
        });
        console.log('Form submitted', response.data);
        navigate('/login');
      } catch (error) {
        console.error('Error message:', error.message);
        console.error('Full error:', error.response ? error.response.data : error);
      }
  };
  

  const handleValidation = (field, value) => {
    let valid = true;
    let message = '';
    if (field === 'email') {
      valid = /\S+@\S+\.\S+/.test(value);
      message = valid ? '' : 'Please enter a valid email address.';
    } else if (field === 'phoneNumber') {
      valid = /^\d+$/.test(value);
      message = valid ? '' : 'Please enter a valid phone number.';
    } else if (field === 'password') {
      valid = value.length >= 6;
      message = valid ? '' : 'Password must be at least 6 characters long.';
    } else if (field === 'confirmPassword') {
      valid = value === password;
      message = valid ? '' : 'Passwords do not match.';
    } else if (field === 'username') {
      valid = !value.includes(' ');
      message = valid ? '' : 'Username should not contain spaces.';
    } else {
      valid = value.trim() !== '';
    }
    setIsValid({ ...isValid, [field]: valid });
    return message;
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') {
        setUsername(value.trim());  // Remove leading/trailing spaces
    } else if (field === 'email') {
      setEmail(value);
    } else if (field === 'phoneNumber') {
      setPhoneNumber(value);
    } else if (field === 'password') {
      setPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
    const message = handleValidation(field, value);
    document.getElementById(field).setCustomValidity(message);
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-customorangedark">
      <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-customorangedark">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-customorangedark">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-transform duration-300 transform hover:scale-[1.02] ${
                isValid.username ? '' : 'border-red-500'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-customorangedark">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-transform duration-300 transform hover:scale-[1.02] ${
                isValid.email ? '' : 'border-red-500'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-customorangedark">Phone Number</label>
            <div className="flex">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
              >
                <option value="+977">Nepal (+977)</option>
                <option value="+1">USA (+1)</option>
                <option value="+91">India (+91)</option>
                {/* Add more country codes as needed */}
              </select>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-transform duration-300 transform hover:scale-[1.02] ${
                  isValid.phoneNumber ? '' : 'border-red-500'
                }`}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-customorangedark">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-transform duration-300 transform hover:scale-[1.02] ${
                isValid.password ? '' : 'border-red-500'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-customorangedark">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-transform duration-300 transform hover:scale-[1.02] ${
                isValid.confirmPassword ? '' : 'border-red-500'
              }`}
              required
            />
          </div>
          <div className='flex justify-center'>
          <button
            type="submit"
            className="w-[90%] bg-customorangedark text-white py-2 rounded-lg hover:bg-customorangelight transition duration-200"
          >
            Sign Up
          </button>
          </div>
        </form>
        <p className="mt-4 text-center text-customorangedark">
          Already have an account? <Link to="/login" className="text-customorangelight hover:underline hover:text-customorangedark transition duration-200">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;