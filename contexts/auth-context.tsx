"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

import { auth } from "@/lib/firebase"
import { createUser, getUserById } from "@/lib/firestore"
import type { User } from "@/lib/types"
import { validateEmail } from "@/lib/email-validator"

interface AuthContextType {
  user: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, name: string, dateOfBirth?: string, gender?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          console.log("🔍 Fetching user profile for:", firebaseUser.uid)
          
          // Add a longer delay to ensure auth token has propagated
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const profile = await getUserById(firebaseUser.uid)
          
          if (profile) {
            console.log("✅ User profile found")
            setUserProfile(profile)
          } else {
            console.log("⚠️ User profile not found, creating new one...")
            
            const newProfile: Omit<User, "id" | "createdAt" | "updatedAt"> = {
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              role: "user",
            }
            
            // Try multiple times with increasing delays
            let attempts = 0
            const maxAttempts = 3
            
            while (attempts < maxAttempts) {
              try {
                await createUser(firebaseUser.uid, newProfile)
                console.log("✅ User profile created successfully")
                
                const createdProfile = await getUserById(firebaseUser.uid)
                setUserProfile(createdProfile)
                break // Success, exit loop
                
              } catch (createError: any) {
                attempts++
                console.error(`❌ Attempt ${attempts} failed:`, createError.code)
                
                if (attempts < maxAttempts) {
                  // Wait before retrying (exponential backoff)
                  const delay = 1000 * attempts
                  console.log(`⏳ Retrying in ${delay}ms...`)
                  await new Promise(resolve => setTimeout(resolve, delay))
                } else {
                  console.error("❌ Max attempts reached. Profile creation failed.")
                  // Don't throw - let user continue, they can try again later
                }
              }
            }
          }
        } catch (error: any) {
          console.error("❌ Error in onAuthStateChanged:", error.code, error.message)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string, dateOfBirth?: string, gender?: string) => {
    try {
      console.log("🚀 Starting sign up process...")
      
      // Validate email domain before proceeding
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || "Invalid email address")
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("✅ Auth user created:", userCredential.user.uid)

      await updateProfile(userCredential.user, { displayName: name })
      console.log("✅ Profile updated")

      // Wait for auth to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("📝 Creating Firestore document...")
      
      await createUser(userCredential.user.uid, {
        email,
        displayName: name,
        dateOfBirth: dateOfBirth || "",
        gender: gender as "male" | "female" | "other" | "prefer-not-to-say" | undefined,
        role: "user",
      })
      
      console.log("✅ Firestore document created successfully!")
    } catch (error: any) {
      console.error("❌ Sign up error:", error.code, error.message)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    // Validate email domain
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error || "Invalid email address")
    }
    
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      await signOut(auth)
      console.log("✅ Signed out successfully")
      
      setUser(null)
      setUserProfile(null)
      
      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
    } catch (error) {
      console.error("❌ Logout error:", error)
      window.location.href = "/login"
    }
  }

  const loginWithGoogle = async () => {
    try {
      console.log("🔵 Starting Google sign-in...")
      
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      console.log("✅ Google authentication successful:", result.user.email)

      // Don't do anything here - let onAuthStateChanged handle it
      // Just wait a bit for the state change to trigger
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("✅ Google sign-in flow complete")
      
    } catch (error: any) {
      console.error("❌ Google login error:", error.code, error.message)
      
      // Provide better error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in cancelled. Please try again.")
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("Pop-up was blocked. Please allow pop-ups for this site.")
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error("Another sign-in popup is open. Please close it first.")
      }
      
      throw error
    }
  }

  const isAdmin = userProfile?.role === "admin"

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    signUp,
    login,
    logout,
    loginWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
