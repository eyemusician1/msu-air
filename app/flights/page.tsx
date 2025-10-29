"use client";

import { Navbar } from "@/components/navbar"
import { FlightResults } from "@/components/flight-results"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/Protected-Route"

export default function FlightsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <Navbar />
        <FlightResults />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}