"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { AlertCircle, Filter, Plane } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { FlightFilters } from "./flight-filters"
import { FlightCard } from "./flight-card"
import type { Flight } from "@/lib/types"
import gsap from "gsap"

export function FlightResults() {
  const searchParams = useSearchParams()
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const departDate = searchParams.get("departDate")
  const directOnly = searchParams.get("directFlightsOnly") === "true"

  useEffect(() => {
    setDirectFlightsOnly(directOnly)
  }, [directOnly])

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (from) params.append("from", from)
        if (to) params.append("to", to)
        if (departDate) params.append("date", departDate)

        const response = await fetch(`/api/flights?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch flights: ${response.status}`)
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          let processedFlights = data
          if (directFlightsOnly) {
            processedFlights = processedFlights.filter((f) => f.stops === "Non-stop")
          }
          setFlights(processedFlights)
          setFilteredFlights(processedFlights)
        } else {
          console.error("API did not return an array:", data)
          setFlights([])
          setFilteredFlights([])
          setError("Invalid data format received from server")
        }
      } catch (error) {
        console.error("Error fetching flights:", error)
        setError("Failed to load flights. Please try again later.")
        setFlights([])
        setFilteredFlights([])
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [from, to, departDate, directFlightsOnly])

  // Animations
  useLayoutEffect(() => {
    if (!loading && filteredFlights.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: "power3.out",
        })

        gsap.from(".flight-card-item", {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        })
      }, containerRef)

      return () => ctx.revert()
    }
  }, [loading, filteredFlights])

  const handleFiltersChange = (filtered: Flight[]) => {
    setFilteredFlights(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
            <Plane className="absolute inset-0 m-auto w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-slate-400">Searching for flights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Flights</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <section
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flight Results</h1>
          <p className="text-slate-400">
            {from && to && (
              <>
                <span className="text-emerald-400 font-semibold">{from}</span> to{" "}
                <span className="text-blue-400 font-semibold">{to}</span>
                {departDate && <> • {new Date(departDate).toLocaleDateString()}</>}
              </>
            )}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {filteredFlights.length} {filteredFlights.length === 1 ? "flight" : "flights"} found
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition w-full justify-center"
        >
          <Filter className="w-4 h-4" />
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <FlightFilters
              flights={flights}
              onFiltersChange={handleFiltersChange}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          </div>

          {/* Flight Results */}
          <div ref={cardsRef} className="lg:col-span-3 space-y-6">
            {filteredFlights.length > 0 ? (
              <>
                {filteredFlights.map((flight, idx) => (
                  <div key={flight.id} className="flight-card-item">
                    <FlightCard flight={flight} isPopular={idx === 0} />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No flights found</h3>
                <p className="text-slate-400">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
