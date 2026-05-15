// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

const ADMIN_EMAILS = [
  'madhavbiplov@gmail.com',
  'igpragyabhusal@gmail.com',
  'laxmihoneyindustry@gmail.com'
];

const PROFILE_PROMPT_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12h

// Strip non-digits, keep last 10 chars (local NP format).
const normalizePhoneField = (raw) => {
  const digits = (raw || '').toString().replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// Build the merged user object from Firebase auth user + Firestore doc data.
const buildUserData = (firebaseUser, docData = {}) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  // Prefer Firestore-stored displayName, fall back to fullName, then firebase auth name
  displayName: docData.displayName || docData.fullName || firebaseUser.displayName || '',
  photoURL: docData.photoURL || firebaseUser.photoURL || '',
  isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
  ...docData,
  // Normalize phone fields so consumers always get clean 10-digit strings,
  // regardless of whether the Firestore doc was written with formatting.
  phoneNumber: normalizePhoneField(docData.phoneNumber),
  secondaryPhone: normalizePhoneField(docData.secondaryPhone),
});

const isProfileCompleteFromData = (data) => {
  if (!data) return false;
  if (data.profileCompleted === true) return true;
  // Legacy users without the flag — fall back to having both phone and address
  return !!(data.phoneNumber && data.address);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPhoneNumber, setNeedsPhoneNumber] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Set during signup so the next auth-state listener fire doesn't show
  // the profile modal in the race window between createUser and setDoc.
  const suppressProfileModalRef = useRef(false);

  // Core: load Firestore data for the current Firebase user, merge, set state,
  // and decide whether to show the profile-completion modal.
  const loadUserData = useCallback(async (firebaseUser, { showModal = true } = {}) => {
    if (!firebaseUser) {
      setUser(null);
      setNeedsPhoneNumber(false);
      setNeedsProfileCompletion(false);
      return null;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const docData = userDoc.exists() ? userDoc.data() : null;

    const merged = buildUserData(firebaseUser, docData || {});
    setUser(merged);

    // If the Firestore doc doesn't exist yet (race during signup), don't
    // trigger the modal — the caller (register / signInWithGoogle) will
    // refresh once the doc lands.
    if (!docData) {
      setNeedsProfileCompletion(false);
      return merged;
    }

    if (showModal) {
      const complete = isProfileCompleteFromData(docData);
      if (!complete && !suppressProfileModalRef.current) {
        const lastPrompt = localStorage.getItem(`lastProfilePrompt_${firebaseUser.uid}`);
        const cutoff = Date.now() - PROFILE_PROMPT_COOLDOWN_MS;
        if (!lastPrompt || parseInt(lastPrompt, 10) < cutoff) {
          setNeedsProfileCompletion(true);
        }
      } else if (complete) {
        setNeedsProfileCompletion(false);
        setNeedsPhoneNumber(false);
      }
    }

    return merged;
  }, []);

  // Public: re-fetch the current user's Firestore data and update state.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return null;
    return loadUserData(auth.currentUser);
  }, [loadUserData]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const u = result.user;
          const userDocRef = doc(db, 'users', u.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              displayName: u.displayName || '',
              fullName: u.displayName || '',
              email: u.email,
              isAdmin: ADMIN_EMAILS.includes(u.email),
              createdAt: new Date(),
              provider: 'google',
              photoURL: u.photoURL || '',
              profileCompleted: false,
            });
          }
          // Refresh user state after redirect login
          await loadUserData(u);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await loadUserData(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [loadUserData]);

  // Email/Password Registration
  const register = async (userData) => {
    try {
      const { password, fullName, phoneNumber } = userData;
      const email = userData.email.trim().toLowerCase();

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
      }

      // Suppress modal during the race window between createUser and setDoc.
      suppressProfileModalRef.current = true;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: fullName });

      // Normalize: keep digits only, take last 10 (local NP format) if longer.
      const rawPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
      const normalizedPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
      const hasPhone = normalizedPhone.length >= 7;

      await setDoc(doc(db, 'users', fbUser.uid), {
        displayName: fullName,
        fullName,
        email,
        phoneNumber: normalizedPhone,
        photoURL: '',
        isAdmin: ADMIN_EMAILS.includes(email),
        createdAt: new Date(),
        provider: 'email',
        // Treat signup as profile-complete if we collected phone; address is
        // gathered at checkout time via the order flow.
        profileCompleted: hasPhone,
      });

      // Re-fetch and update state from the freshly-written doc.
      await loadUserData(fbUser);
      suppressProfileModalRef.current = false;

      return { success: true, message: 'Account created successfully! Welcome to Laxmi Honey Industry!' };
    } catch (error) {
      suppressProfileModalRef.current = false;
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign-up is currently disabled.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true, message: 'Welcome back!' };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'auth/invalid-credential' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection and try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Google Sign In with redirect fallback
  const signInWithGoogle = async (useRedirect = false) => {
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, message: 'Redirecting...', redirecting: true };
      }

      suppressProfileModalRef.current = true;
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          displayName: fbUser.displayName || '',
          fullName: fbUser.displayName || '',
          email: fbUser.email,
          isAdmin: ADMIN_EMAILS.includes(fbUser.email),
          createdAt: new Date(),
          provider: 'google',
          photoURL: fbUser.photoURL || '',
          profileCompleted: false, // Google users must still add phone/address
        });
      }

      await loadUserData(fbUser);
      suppressProfileModalRef.current = false;

      return { success: true };
    } catch (error) {
      suppressProfileModalRef.current = false;
      console.error('Google sign in error:', error);

      if (error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: '', cancelled: true };
      }

      if (error.code === 'auth/popup-blocked' ||
          (error.message && error.message.includes('Cross-Origin-Opener-Policy'))) {
        try {
          return await signInWithGoogle(true);
        } catch (redirectErr) {
          console.error('Redirect fallback failed:', redirectErr);
          return { success: false, error: 'Unable to sign in with Google. Please try again.' };
        }
      }

      let errorMessage = 'Google sign-in failed. Please try again.';
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setNeedsPhoneNumber(false);
      setNeedsProfileCompletion(false);

      localStorage.removeItem('authToken');
      localStorage.removeItem('chatbot_anonymous_id');

      Object.keys(localStorage).forEach((key) => {
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

  // Check if email exists — Firestore first, legacy API as fallback.
  const checkEmailExists = async (email) => {
    if (!email || !email.includes('@')) return false;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return true;

      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        return signInMethods.length > 0;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const skipProfileCompletion = () => {
    if (user) {
      localStorage.setItem(`lastProfilePrompt_${user.uid}`, Date.now().toString());
    }
    setNeedsProfileCompletion(false);
    setNeedsPhoneNumber(false);
  };

  // Generic update for the user's Firestore doc; refreshes local state.
  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not signed in.' };
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date(),
      });
      await refreshUser();
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const markProfileComplete = async (profileData) => {
    if (!user) return false;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        profileCompleted: true,
        profileCompletedAt: new Date(),
        lastUpdated: new Date(),
      });

      localStorage.removeItem(`lastProfilePrompt_${user.uid}`);

      await refreshUser();
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
    updateUserProfile,
    refreshUser,
    checkIfCanOrder,
    isAdmin: user?.isAdmin || false,
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
