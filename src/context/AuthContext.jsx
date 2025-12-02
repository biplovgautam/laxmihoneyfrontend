// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [lastProfilePrompt, setLastProfilePrompt] = useState(null);

  useEffect(() => {
    // Handle redirect result first
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
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
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };

    handleRedirectResult();

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

        // Check if profile is complete
        const profileComplete = userData.phoneNumber && userData.address;
        const lastPrompt = localStorage.getItem(`lastProfilePrompt_${firebaseUser.uid}`);
        const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
        
        if (!profileComplete) {
          if (!lastPrompt || parseInt(lastPrompt) < twelveHoursAgo) {
            setNeedsProfileCompletion(true);
          }
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

  // Google Sign In with redirect fallback
  const signInWithGoogle = async (useRedirect = false) => {
    try {
      if (useRedirect) {
        // Use redirect method to avoid COOP issues
        await signInWithRedirect(auth, googleProvider);
        return { success: true, message: 'Redirecting...' };
      } else {
        // Try popup first
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
          // New Google users will be prompted for profile completion via the existing logic
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // If popup fails due to COOP or other popup-related issues, try redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup blocked, trying redirect method...');
        return await signInWithGoogle(true);
      }
      
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setNeedsPhoneNumber(false);
      setNeedsProfileCompletion(false);
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('chatbot_anonymous_id');
      
      // Clear any profile prompt timestamps
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('lastProfilePrompt_')) {
          localStorage.removeItem(key);
        }
      });
      
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

  const skipProfileCompletion = () => {
    if (user) {
      // Store timestamp when user skips profile completion
      localStorage.setItem(`lastProfilePrompt_${user.uid}`, Date.now().toString());
    }
    setNeedsProfileCompletion(false);
    setNeedsPhoneNumber(false);
  };

  const markProfileComplete = async (profileData) => {
    if (!user) return false;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        profileCompleted: true,
        profileCompletedAt: new Date()
      });

      // Remove the profile prompt timestamp
      localStorage.removeItem(`lastProfilePrompt_${user.uid}`);
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        profileCompleted: true
      }));

      // Reset both modal states
      setNeedsProfileCompletion(false);
      setNeedsPhoneNumber(false);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const checkIfCanOrder = () => {
    if (!user) return false;
    return user.phoneNumber && user.address;
  };

  const value = {
    user,
    loading,
    needsPhoneNumber,
    needsProfileCompletion,
    register,
    login,
    signInWithGoogle,
    logout,
    checkEmailExists,
    skipProfileCompletion,
    markProfileComplete,
    checkIfCanOrder,
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