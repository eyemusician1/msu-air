"use client"

import type React from "react"
import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import gsap from "gsap"

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

  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRefs = useRef<(HTMLDivElement | null)[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const googleBtnRef = useRef<HTMLButtonElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // Initial page load animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Set initial states
      gsap.set([logoRef.current, formRef.current, footerRef.current], {
        opacity: 0,
        y: 30,
      })

      // Animate image panel from right
      gsap.from(imageRef.current, {
        opacity: 0,
        x: 100,
        duration: 1,
        ease: "power3.out",
      })

      // Animate logo
      tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.6 })

      // Animate header title letters
      gsap.from(".header-letter", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.03,
        ease: "back.out(1.7)",
        delay: 0.3,
      })

      // Animate subtitle
      gsap.from(".header-subtitle", {
        opacity: 0,
        y: 15,
        duration: 0.5,
        delay: 0.8,
        ease: "power2.out",
      })

      // Continue with form and footer
      tl.to(formRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(footerRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")

      // Stagger input fields
      gsap.from(inputRefs.current.filter(Boolean), {
        opacity: 0,
        x: -20,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.5,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isLogin])

  // Form mode switch animation
  const handleModeSwitch = () => {
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
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
      },
    })

    tl.to(formRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
    }).to(formRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
    })
  }

  // Error shake animation
  const shakeForm = () => {
    gsap.to(formRef.current, {
      keyframes: [
        { x: -10, duration: 0.08 },
        { x: 10, duration: 0.08 },
        { x: -10, duration: 0.08 },
        { x: 10, duration: 0.08 },
        { x: 0, duration: 0.08 },
      ],
      ease: "power2.out",
    })
  }

  // Success animation before redirect
  const animateSuccess = () => {
    gsap.to(formRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    })
  }

  // Button hover animation
  const handleButtonHover = (ref: React.RefObject<HTMLButtonElement | null>, isEnter: boolean) => {
    gsap.to(ref.current, {
      scale: isEnter ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  // Input focus animation
  const handleInputFocus = (index: number) => {
    gsap.to(inputRefs.current[index], {
      scale: 1.01,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const handleInputBlur = (index: number) => {
    gsap.to(inputRefs.current[index], {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

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
      case "auth/email-already-in-use":
        return "This email is already registered"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/operation-not-allowed":
        return "Operation not allowed"
      case "auth/weak-password":
        return "Password is too weak"
      case "auth/user-disabled":
        return "This account has been disabled"
      case "auth/user-not-found":
        return "No account found with this email"
      case "auth/wrong-password":
        return "Incorrect password"
      case "auth/invalid-credential":
        return "Invalid email or password"
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later"
      case "auth/network-request-failed":
        return "Network error. Please check your connection"
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed"
      default:
        return error.message || "An error occurred. Please try again"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")

    if (!validateForm()) {
      shakeForm()
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }

      animateSuccess()
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    } catch (error: any) {
      console.error("Auth error:", error)
      setAuthError(getFirebaseErrorMessage(error))
      setIsSubmitting(false)
      shakeForm()
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("")
    setIsSubmitting(true)

    try {
      await loginWithGoogle()
      animateSuccess()
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    } catch (error: any) {
      console.error("Google sign-in error:", error)
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

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }

    if (authError) {
      setAuthError("")
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex bg-slate-900"
    >
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div ref={logoRef} className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/plane.png"
              alt="Skyrithm"
              className="w-10 h-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Skyrithm
            </span>
          </div>

          {/* Animated Header */}
          <div ref={headerRef} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {(isLogin ? "Welcome Back" : "Create Account").split("").map((char, index) => (
                <span key={index} className="header-letter inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p className="header-subtitle text-slate-400 text-lg">
              {isLogin ? "Sign in to your account" : "Join us for seamless travel"}
            </p>
          </div>

          {/* Form Card */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
          >
            {/* Auth Error Alert */}
            {authError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-200 text-sm">{authError}</span>
              </div>
            )}

            {/* Name Field - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[0] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(0)}
                  onBlur={() => handleInputBlur(0)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
                {errors.name && (
                  <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div ref={(el) => { inputRefs.current[1] = el }} className="mb-5">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(1)}
                  onBlur={() => handleInputBlur(1)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div ref={(el) => { inputRefs.current[2] = el }} className="mb-5">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(2)}
                  onBlur={() => handleInputBlur(2)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[3] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus(3)}
                    onBlur={() => handleInputBlur(3)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password - Login Only */}
            {isLogin && (
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={isSubmitting}
              onMouseEnter={() => handleButtonHover(buttonRef, true)}
              onMouseLeave={() => handleButtonHover(buttonRef, false)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? "Sign In" : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              ref={googleBtnRef}
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              onMouseEnter={() => handleButtonHover(googleBtnRef, true)}
              onMouseLeave={() => handleButtonHover(googleBtnRef, false)}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-slate-600/50 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            {/* Toggle Sign In/Sign Up */}
            <div ref={footerRef} className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image Panel */}
      <div
        ref={imageRef}
        className="hidden lg:block lg:w-1/2 relative"
      >
        {/* Image */}
        <Image
          src="/airport1.jpg"
          alt="Airport terminal"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Content on image */}
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Journey Starts Here
            </h2>
            <p className="text-slate-300 text-lg">
              Discover seamless travel experiences with Skyrithm. Book flights, manage your trips, and explore the world with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
