// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

// Admin emails
const ADMIN_EMAILS = [
  'madhavbiplov@gmail.com',
  'igpragyabhusal@gmail.com', 
  'laxmihoneyindustry@gmail.com'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPhoneNumber, setNeedsPhoneNumber] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
          ...userDoc.data()
        };

        // Check if Google user needs phone number
        if (firebaseUser.providerData[0]?.providerId === 'google.com' && !userData.phoneNumber) {
          setNeedsPhoneNumber(true);
        }

        setUser(userData);
      } else {
        setUser(null);
        setNeedsPhoneNumber(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/Password Registration
  const register = async (userData) => {
    try {
      const { email, password, fullName, phoneNumber } = userData;
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: fullName
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phoneNumber,
        isAdmin: ADMIN_EMAILS.includes(email),
        createdAt: new Date(),
        provider: 'email'
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          fullName: user.displayName,
          email: user.email,
          isAdmin: ADMIN_EMAILS.includes(user.email),
          createdAt: new Date(),
          provider: 'google',
          photoURL: user.photoURL
        });
        setNeedsPhoneNumber(true);
      }

      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update phone number for Google users
  const updatePhoneNumber = async (phoneNumber) => {
    try {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { phoneNumber });
        setNeedsPhoneNumber(false);
        return { success: true };
      }
    } catch (error) {
      console.error('Phone number update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setNeedsPhoneNumber(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if email exists
  const checkEmailExists = async (email) => {
    // This will be implemented using a Firebase function or by attempting to sign in
    // For now, we'll use a simple approach
    return false; // Implement actual check
  };

  const value = {
    user,
    loading,
    needsPhoneNumber,
    register,
    login,
    signInWithGoogle,
    logout,
    updatePhoneNumber,
    checkEmailExists,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};