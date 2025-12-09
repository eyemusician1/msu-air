"use client"

import type React from "react"
import { useState, useRef, useLayoutEffect } from "react"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import gsap from "gsap"
import { validateEmail } from "@/lib/email-validator"

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string>("")

  const { signUp, login, loginWithGoogle } = useAuth()
  const router = useRouter()

  // Animation refs
  const containerRef = useRef(null)
  const logoRef = useRef(null)
  const headerRef = useRef(null)
  const formRef = useRef(null)
  const inputRefs = useRef<(HTMLDivElement | null)[]>([])
  const buttonRef = useRef(null)
  const googleBtnRef = useRef(null)
  const footerRef = useRef(null)
  const imageRef = useRef(null)

  // Initial page load animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      gsap.set([logoRef.current, formRef.current, footerRef.current], { opacity: 0, y: 30 })
      gsap.from(imageRef.current, { opacity: 0, x: 100, duration: 1, ease: "power3.out" })

      tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.6 })

      gsap.from(".header-letter", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.03,
        ease: "back.out(1.7)",
        delay: 0.3,
      })

      gsap.from(".header-subtitle", {
        opacity: 0,
        y: 15,
        duration: 0.5,
        delay: 0.8,
        ease: "power2.out",
      })

      tl.to(formRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3").to(
        footerRef.current,
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2",
      )

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
          dateOfBirth: "",
          gender: "",
          rememberMe: false,
        })
      },
    })

    tl.to(formRef.current, { opacity: 0, scale: 0.95, duration: 0.25 }).to(formRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
    })
  }

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

  const animateSuccess = () => {
    gsap.to(formRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    })
  }

  const handleButtonHover = (ref: React.RefObject<HTMLButtonElement>, isEnter: boolean) => {
    gsap.to(ref.current, {
      scale: isEnter ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

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

  const handleEmailBlur = () => {
    if (formData.email) {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.isValid) {
        setErrors({ ...errors, email: emailValidation.error || "Invalid email" })
      } else {
        // Clear error if valid
        const newErrors = { ...errors }
        delete newErrors.email
        setErrors(newErrors)
      }
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Email validation with domain checking
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || "Invalid email"
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

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required"
      }

      if (!formData.gender) {
        newErrors.gender = "Please select your gender"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFirebaseErrorMessage = (error: any): string => {
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
        await signUp(formData.email, formData.password, formData.name, formData.dateOfBirth, formData.gender)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

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
    <div ref={containerRef} className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div ref={logoRef} className="flex items-center justify-center gap-3 mb-8">
            <img src="/plane.png" alt="Skyrithm Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-emerald-400">Skyrithm</span>
          </div>

          {/* Animated Header */}
          <div ref={headerRef} className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {(isLogin ? "Welcome Back" : "Create Account").split("").map((char, index) => (
                <span key={index} className="header-letter inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p className="header-subtitle text-slate-400">
              {isLogin ? "Sign in to your account" : "Join us for seamless travel"}
            </p>
          </div>

          {/* Form Card */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8"
          >
            {/* Auth Error Alert */}
            {authError && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            {/* Name Field - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[0] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(0)}
                  onBlur={() => handleInputBlur(0)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div ref={(el) => { inputRefs.current[1] = el }} className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(1)}
                  onBlur={() => {
                    handleInputBlur(1)
                    handleEmailBlur()
                  }}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
              {errors.email ? (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                 
                </p>
              )}
            </div>

            {/* Date of Birth Field - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[2] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus(2)}
                    onBlur={() => handleInputBlur(2)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 color-scheme:dark"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            )}

            {/* Gender Field - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[3] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus(3)}
                    onBlur={() => handleInputBlur(3)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-800 text-slate-400">Select gender</option>
                    <option value="male" className="bg-slate-800">Male</option>
                    <option value="female" className="bg-slate-800">Female</option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.gender}
                  </p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div ref={(el) => { inputRefs.current[4] = el }} className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus(4)}
                  onBlur={() => handleInputBlur(4)}
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
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Sign Up Only */}
            {!isLogin && (
              <div ref={(el) => { inputRefs.current[5] = el }} className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus(5)}
                    onBlur={() => handleInputBlur(5)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password - Login Only */}
            {isLogin && (
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
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
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-500">Or continue with</span>
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
          </form>

          {/* Toggle Sign In/Sign Up */}
          <p ref={footerRef} className="text-center mt-6 text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={handleModeSwitch}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image Panel */}
      <div ref={imageRef} className="hidden lg:block lg:w-1/2 relative">
        <Image src="/airport1.jpg" alt="Travel" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Your Journey Starts Here</h2>
          <p className="text-lg text-slate-300 max-w-md">
            Discover seamless travel experiences with Skyrithm. Book flights, manage your trips, and explore the world with ease.
          </p>
        </div>
      </div>
    </div>
  )
}
