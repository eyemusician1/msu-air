"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, createUser } from '@/lib/firestore';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;  // ADD THIS
  loading: boolean;
  isAdmin: boolean;  // ADD THIS
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const profile = await getUserById(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Create user profile if it doesn't exist
            const newProfile: Omit<User, "id" | "createdAt" | "updatedAt"> = {
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "user", // Default role
            };
            await createUser(firebaseUser.uid, newProfile);
            const createdProfile = await getUserById(firebaseUser.uid);
            setUserProfile(createdProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user profile in Firestore
      const newProfile: Omit<User, "id" | "createdAt" | "updatedAt"> = {
        email: email,
        displayName: name,
        role: "user",
      };
      await createUser(userCredential.user.uid, newProfile);
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    if (result.user) {
      // The useEffect hook will handle profile creation
      console.log("Google sign-in successful:", result.user.email);
    }
  } catch (error: any) {
    console.error("Google login error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google sign-in');
    } else {
      throw error;
    }
  }
};

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = userProfile?.role === "admin";

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    signUp,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}