"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { FlightFilters } from "./flight-filters"
import { FlightCard } from "./flight-card"
import { SearchSummary } from "./search-summary"
import type { Flight } from "@/lib/types"

export function FlightResults() {
  const searchParams = useSearchParams()
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false)

  // Get search parameters
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

          // Apply direct flights filter if requested
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
  }, [from, to, departDate])

  const handleFiltersChange = (filtered: Flight[]) => {
    setFilteredFlights(filtered)
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading flights...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-semibold mb-2">Error Loading Flights</p>
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchSummary />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flight Results</h1>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {from && to && (
                <>
                  <span className="font-semibold text-emerald-400">{from}</span> to{" "}
                  <span className="font-semibold text-emerald-400">{to}</span> •{" "}
                </>
              )}
              <span className="font-semibold text-emerald-400">{filteredFlights.length}</span> flights found
            </p>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
              <FlightFilters flights={flights} onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.length > 0 ? (
              <>
                {filteredFlights.map((flight, idx) => (
                  <FlightCard key={flight.id} flight={flight} isPopular={idx === 0 && filteredFlights.length > 1} />
                ))}
              </>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg font-semibold mb-2">No flights found</p>
                <p className="text-slate-400 text-sm">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
