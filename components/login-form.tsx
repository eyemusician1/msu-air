"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mail, Lock, Plane, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState("")
  
  const { signUp, login, loginWithGoogle } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Full name is required"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFirebaseErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/operation-not-allowed':
        return 'Operation not allowed'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      case 'auth/user-not-found':
        return 'No account found with this email'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/invalid-credential':
        return 'Invalid email or password'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed'
      default:
        return error.message || 'An error occurred. Please try again'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }
      
      // Small delay to ensure Firebase auth state is updated
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    } catch (error: any) {
      console.error('Auth error:', error)
      setAuthError(getFirebaseErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("")
    setIsSubmitting(true)

    try {
      await loginWithGoogle()
      // Small delay to ensure Firebase auth state is updated
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setAuthError(getFirebaseErrorMessage(error))
      setIsSubmitting(false)
    }
  }
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError("")
    }
  }

  return (
    <section className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-emerald-500/20 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Plane className="text-white" size={24} />
            </div>
            <span className="font-bold text-2xl text-white">Skyrithm</span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-300 text-center mb-8">
            {isLogin ? "Sign in to your account" : "Join us for seamless travel"}
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-red-400 text-sm">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 transition text-white placeholder-slate-400 ${
                    errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-600 focus:ring-teal-500"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                    <AlertCircle size={14} /> {errors.name}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 transition text-white placeholder-slate-400 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-slate-600 focus:ring-teal-500"
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle size={14} /> {errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 transition text-white placeholder-slate-400 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-slate-600 focus:ring-teal-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle size={14} /> {errors.password}
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 transition text-white placeholder-slate-400 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-teal-500"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                    <AlertCircle size={14} /> {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

         <button
  type="button"
  onClick={handleGoogleSignIn}
  disabled={isSubmitting}
  className="w-full py-3 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-emerald-500/50 transition font-semibold text-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
>
  <div className="flex items-center justify-center w-5 h-5">
    <svg
      className="w-5 h-5 group-hover:scale-110 transition-transform"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  </div>
  <span className="text-base">Google</span>
</button>


          

          <p className="text-center text-slate-300 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setAuthError("")
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  rememberMe: false,
                })
              }}
              className="text-emerald-400 font-semibold hover:text-emerald-300"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}