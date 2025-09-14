// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  increment,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription to cart and favorites
  useEffect(() => {
    if (!user?.uid) {
      setCartItems([]);
      setFavoriteItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to cart items
    const cartQuery = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid)
    );

    const unsubscribeCart = onSnapshot(cartQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(items);
    });

    // Subscribe to favorite items
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );

    const unsubscribeFavorites = onSnapshot(favoritesQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavoriteItems(items);
    });

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubscribeCart();
      unsubscribeFavorites();
    };
  }, [user?.uid]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user?.uid) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const existingItem = cartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity - increment by the specified amount
        const cartItemRef = doc(db, 'cart', existingItem.id);
        const newQuantity = existingItem.quantity + quantity;
        await updateDoc(cartItemRef, {
          quantity: newQuantity,
          updatedAt: new Date()
        });
        return { success: true, action: 'updated', newQuantity };
      } else {
        // Add new item
        const cartItemRef = doc(collection(db, 'cart'));
        await setDoc(cartItemRef, {
          userId: user.uid,
          productId,
          quantity,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return { success: true, action: 'added', newQuantity: quantity };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user?.uid) {
      throw new Error('Please login to manage cart');
    }

    try {
      const cartItem = cartItems.find(item => item.productId === productId);
      if (cartItem) {
        await deleteDoc(doc(db, 'cart', cartItem.id));
      }
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  };

  // Update cart item quantity
  const updateCartQuantity = async (productId, quantity) => {
    if (!user?.uid) {
      throw new Error('Please login to manage cart');
    }

    try {
      const cartItem = cartItems.find(item => item.productId === productId);
      if (cartItem) {
        if (quantity <= 0) {
          await removeFromCart(productId);
        } else {
          const cartItemRef = doc(db, 'cart', cartItem.id);
          await updateDoc(cartItemRef, {
            quantity,
            updatedAt: new Date()
          });
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw new Error('Failed to update cart quantity');
    }
  };

  // Add/remove from favorites
  const toggleFavorite = async (productId) => {
    if (!user?.uid) {
      throw new Error('Please login to manage favorites');
    }

    try {
      const existingFavorite = favoriteItems.find(item => item.productId === productId);
      
      if (existingFavorite) {
        // Remove from favorites
        await deleteDoc(doc(db, 'favorites', existingFavorite.id));
        return { success: true, action: 'removed' };
      } else {
        // Add to favorites
        const favoriteRef = doc(collection(db, 'favorites'));
        await setDoc(favoriteRef, {
          userId: user.uid,
          productId,
          createdAt: new Date()
        });
        return { success: true, action: 'added' };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to update favorites');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user?.uid) {
      throw new Error('Please login to manage cart');
    }

    try {
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        batch.delete(doc(db, 'cart', item.id));
      });
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  };

  // Helper functions
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  const isFavorite = (productId) => {
    return favoriteItems.some(item => item.productId === productId);
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    favoriteItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleFavorite,
    clearCart,
    isInCart,
    isFavorite,
    getCartItemQuantity,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
