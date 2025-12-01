"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FlightSearch } from "@/components/flight-search"
import { Footer } from "@/components/footer"
import { VideoAdBanner } from "@/components/video-ad"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      {/* Video Ad Banner - Logo emphasized */}
      <div className="container mx-auto px-4 pt-6">
        <VideoAdBanner 
          link="https://msu-air.vercel.app/login"
          className="mb-6"
        />
      </div>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Flight Search Form */}
      <div className="container mx-auto px-4 py-8">
        <FlightSearch />
      </div>
      
      <Footer />
    </div>
  )
}
