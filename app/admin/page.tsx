"use client"

import { Navbar } from "@/components/navbar"
import { AdminPanel } from "@/components/admin-panel"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShieldAlert } from "lucide-react"

export default function Admin() {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        router.replace('/login')
      } else if (userProfile && !isAdmin) {
        // Logged in but not admin - redirect to home
        router.replace('/')
      }
    }
  }, [user, userProfile, loading, isAdmin, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  // Not authorized (not admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-300 mb-6">
            You don't have permission to access this page. Only administrators can view this content.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and is admin
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AdminPanel />
      <Footer />
    </main>
  )
}