import React from 'react';
import { useAuth } from '../context/AuthContext';

const OrderButton = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false, 
  ...props 
}) => {
  const { user, checkIfCanOrder } = useAuth();
  
  const canOrder = checkIfCanOrder();
  const isDisabled = disabled || !canOrder;
  
  const handleClick = (e) => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }
    
    if (!canOrder) {
      // Show alert about profile completion
      alert('Please complete your profile (phone number and address) to place orders.');
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${className}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        relative
      `}
    >
      {children}
      {!canOrder && user && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          !
        </span>
      )}
    </button>
  );
};

export default OrderButton;
