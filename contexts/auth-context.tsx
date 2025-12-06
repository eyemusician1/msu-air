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
          const profile = await getUserById(firebaseUser.uid)
          if (profile) {
            setUserProfile(profile)
          } else {
            // Create user profile if it doesn't exist
            const newProfile: Omit<User, "id" | "createdAt" | "updatedAt"> = {
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "user",
            }
            await createUser(firebaseUser.uid, newProfile)
            const createdProfile = await getUserById(firebaseUser.uid)
            setUserProfile(createdProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("✅ Auth user created:", userCredential.user.uid)

      await updateProfile(userCredential.user, { displayName: name })
      console.log("✅ Profile updated")

      console.log("📝 Creating Firestore document with data:", {
        email,
        displayName: name,
        dateOfBirth,
        gender,
        role: "user",
      })

      await createUser(userCredential.user.uid, {
        email,
        displayName: name,
        dateOfBirth: dateOfBirth || "",
        gender: gender as "male" | "female" | "other" | "prefer-not-to-say" | undefined,
        role: "user",
      })

      console.log("✅ Firestore document created successfully!")
    } catch (error: any) {
      console.error("❌ Sign up error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      
      // Sign out from Firebase
      await signOut(auth)
      
      console.log("✅ Signed out successfully")
      
      // Clear local state
      setUser(null)
      setUserProfile(null)
      
      // Redirect to login page after a small delay
      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
      
    } catch (error) {
      console.error("❌ Logout error:", error)
      // Even if there's an error, try to redirect
      window.location.href = "/login"
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      if (result.user) {
        // Check if user document exists, create if not
        const existingProfile = await getUserById(result.user.uid)
        
        if (!existingProfile) {
          await createUser(result.user.uid, {
            email: result.user.email || "",
            displayName: result.user.displayName || "",
            role: "user",
          })
        }
      }
    } catch (error: any) {
      console.error("Google login error:", error)
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
