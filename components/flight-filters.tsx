"use client"

import { useState, useEffect } from "react"
import { Filter, X, ChevronDown, RotateCcw } from "lucide-react"
import type { Flight } from "@/lib/types"

interface FlightFiltersProps {
  flights: Flight[]
  onFiltersChange: (filtered: Flight[]) => void
  isOpen?: boolean
  onClose?: () => void
}

export function FlightFilters({ flights, onFiltersChange, isOpen = true, onClose }: FlightFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [selectedStops, setSelectedStops] = useState<string[]>(["Non-stop", "1 Stop"])
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["Morning", "Afternoon", "Evening"])
  const [selectedDuration, setSelectedDuration] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "duration" | "departure">("price-low")
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    airlines: true,
    stops: true,
    time: true,
    duration: true,
  })

  const airlines = Array.from(new Set(flights.map((f) => f.airline)))

  useEffect(() => {
    applyFilters()
  }, [priceRange, selectedAirlines, selectedStops, selectedTimes, selectedDuration, sortBy, flights])

  const applyFilters = () => {
    const filtered = flights.filter((flight) => {
      if (!flight) return false
      if (flight.price < priceRange[0] || flight.price > priceRange[1]) return false
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) return false
      if (selectedStops.length > 0 && !selectedStops.includes(flight.stops || "Non-stop")) return false

      if (selectedTimes.length > 0) {
        const hour = Number.parseInt(flight.departure?.split(":")[0] || "0")
        const timeOfDay = hour >= 6 && hour < 12 ? "Morning" : hour >= 12 && hour < 18 ? "Afternoon" : "Evening"
        if (!selectedTimes.includes(timeOfDay)) return false
      }

      if (selectedDuration.length > 0) {
        const durationMatch = flight.duration?.match(/(\d+)h/)
        const hours = durationMatch ? Number.parseInt(durationMatch[1]) : 0
        const durationInRange = selectedDuration.some((range) => {
          if (range === "0-3" && hours <= 3) return true
          if (range === "3-6" && hours > 3 && hours <= 6) return true
          if (range === "6+" && hours > 6) return true
          return false
        })
        if (!durationInRange) return false
      }

      return true
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "duration":
          const durationA = Number.parseInt(a.duration?.split("h")[0] || "0")
          const durationB = Number.parseInt(b.duration?.split("h")[0] || "0")
          return durationA - durationB
        case "departure":
          return a.departure.localeCompare(b.departure)
        default:
          return 0
      }
    })

    onFiltersChange(filtered)
  }

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    )
  }

  const toggleStop = (stop: string) => {
    setSelectedStops((prev) =>
      prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
    )
  }

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleDuration = (duration: string) => {
    setSelectedDuration((prev) =>
      prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration]
    )
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const resetFilters = () => {
    setPriceRange([0, 15000])
    setSelectedAirlines([])
    setSelectedStops(["Non-stop", "1 Stop"])
    setSelectedTimes(["Morning", "Afternoon", "Evening"])
    setSelectedDuration([])
    setSortBy("price-low")
  }

  if (!isOpen) return null

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Filters</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-slate-300 mb-2 block">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="w-full bg-slate-700/50 text-white border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        >
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="duration">Duration: Shortest First</option>
          <option value="departure">Departure Time</option>
        </select>
      </div>

      <div className="space-y-4">
        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 transition"
          >
            <span className="font-semibold text-slate-200">Price Range</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.price ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.price && (
            <div className="mt-3 px-3">
              <input
                type="range"
                min="0"
                max="15000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-emerald-500 mb-2"
              />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">₱{priceRange[0].toLocaleString()}</span>
                <span className="text-emerald-400 font-semibold">₱{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Airlines */}
        <div>
          <button
            onClick={() => toggleSection("airlines")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 transition"
          >
            <span className="font-semibold text-slate-200">Airlines</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.airlines ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.airlines && (
            <div className="mt-3 space-y-2 px-3">
              {airlines.map((airline) => (
                <label key={airline} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition">{airline}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Stops */}
        <div>
          <button
            onClick={() => toggleSection("stops")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 transition"
          >
            <span className="font-semibold text-slate-200">Stops</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.stops ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.stops && (
            <div className="mt-3 space-y-2 px-3">
              {["Non-stop", "1 Stop", "2+ Stops"].map((stop) => (
                <label key={stop} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(stop)}
                    onChange={() => toggleStop(stop)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition">{stop}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Departure Time */}
        <div>
          <button
            onClick={() => toggleSection("time")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 transition"
          >
            <span className="font-semibold text-slate-200">Departure Time</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.time ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.time && (
            <div className="mt-3 space-y-2 px-3">
              {[
                { label: "Morning (6am - 12pm)", value: "Morning" },
                { label: "Afternoon (12pm - 6pm)", value: "Afternoon" },
                { label: "Evening (6pm - 12am)", value: "Evening" },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTimes.includes(value)}
                    onChange={() => toggleTime(value)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <button
            onClick={() => toggleSection("duration")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 transition"
          >
            <span className="font-semibold text-slate-200">Flight Duration</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.duration ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.duration && (
            <div className="mt-3 space-y-2 px-3">
              {[
                { label: "Up to 3 hours", value: "0-3" },
                { label: "3 to 6 hours", value: "3-6" },
                { label: "6+ hours", value: "6+" },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedDuration.includes(value)}
                    onChange={() => toggleDuration(value)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full mt-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Filters
      </button>
    </div>
  )
}
