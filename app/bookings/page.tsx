"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookingCard } from "@/components/booking-card"
import { Loader2 } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<(Booking & { flight?: Flight })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user's bookings
        const bookingsRes = await fetch(`/api/bookings?userId=${user.uid}`)
        if (!bookingsRes.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const bookingsData = await bookingsRes.json()

        // Fetch flight details for each booking
        const bookingsWithFlights = await Promise.all(
          bookingsData.map(async (booking: Booking) => {
            try {
              const flightRes = await fetch(`/api/flights/${booking.flightId}`)
              if (flightRes.ok) {
                const flight = await flightRes.json()
                return { ...booking, flight }
              }
              return booking
            } catch {
              return booking
            }
          }),
        )

        setBookings(bookingsWithFlights)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user?.uid])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-slate-400">View and manage your flight reservations</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-300">Loading your bookings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
              <span className="text-2xl">✈️</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
            <p className="text-slate-400 mb-6">Start your journey by booking a flight</p>
            <button
              onClick={() => router.push("/flights")}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition font-semibold"
            >
              Browse Flights
            </button>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
