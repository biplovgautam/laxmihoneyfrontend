// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail
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
      
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
      }
      
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

      return { success: true, message: 'Account created successfully! Welcome to Laxmi Honey Industry!' };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Welcome back!' };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
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
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
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