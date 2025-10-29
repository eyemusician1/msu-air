"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

export default function Login() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    )
  }

  // Don't render login form if user is authenticated (prevents flash)
  if (user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <LoginForm />
      <Footer />
    </main>
  )
}