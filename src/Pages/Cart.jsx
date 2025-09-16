// src/Pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { LottieLoader } from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Cart = () => {
  const { user } = useAuth();
  const { 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    loading 
  } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartProducts();
  }, [cartItems]);

  const fetchCartProducts = async () => {
    if (cartItems.length === 0) {
      setCartProducts([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    try {
      const productPromises = cartItems.map(async (cartItem) => {
        const productDoc = await getDoc(doc(db, 'products', cartItem.productId));
        if (productDoc.exists()) {
          return {
            ...productDoc.data(),
            id: productDoc.id,
            cartQuantity: cartItem.quantity,
            cartId: cartItem.id
          };
        }
        return null;
      });

      const products = (await Promise.all(productPromises)).filter(Boolean);
      setCartProducts(products);
    } catch (error) {
      console.error('Error fetching cart products:', error);
      showToast('Error loading cart items', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartQuantity(productId, newQuantity);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleRemoveItem = async (productId, productTitle) => {
    try {
      await removeFromCart(productId);
      showToast(`${productTitle} removed from cart`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await clearCart();
      showToast('Cart cleared successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const calculateSubtotal = () => {
    return cartProducts.reduce((total, product) => {
      return total + (product.price * product.cartQuantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
    return subtotal + shipping;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <Link
            to="/login"
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LottieLoader 
            size="large" 
            text="Preparing your shopping cart..." 
            className="text-gray-600"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          </div>
          
          {cartProducts.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
              <FaShoppingBag className="mx-auto text-8xl text-gray-300 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Link
                to="/products"
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors inline-block"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.images?.[0] ? getOptimizedImageUrl(product.images[0], { width: 120, height: 120 }) : '/placeholder-product.jpg'}
                        alt={product.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-amber-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{product.shortDescription}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold text-amber-600">
                          ₹{formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(product.id, product.cartQuantity - 1)}
                        disabled={product.cartQuantity <= 1}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      
                      <span className="font-semibold text-lg min-w-[2rem] text-center">
                        {product.cartQuantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(product.id, product.cartQuantity + 1)}
                        disabled={product.cartQuantity >= (product.stock || 999)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[5rem]">
                      <div className="font-bold text-lg text-gray-800">
                        ₹{formatPrice(product.price * product.cartQuantity)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(product.id, product.title)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg sticky top-8"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartProducts.length} items)</span>
                    <span className="font-semibold">₹{formatPrice(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {calculateSubtotal() > 1000 ? 'Free' : `₹${formatPrice(50)}`}
                    </span>
                  </div>
                  
                  {calculateSubtotal() > 1000 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      🎉 You got free shipping!
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">₹{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
                
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg mt-6 transition-colors">
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/products"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg mt-3 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Cart;
