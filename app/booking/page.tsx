"use client";

import { Navbar } from "@/components/navbar"
import { BookingPage } from "@/components/booking-page"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/Protected-Route"

export default function Booking() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <Navbar />
        <BookingPage />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}