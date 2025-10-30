"use client"

import { useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import type { Flight } from "@/lib/types"

interface FlightFiltersProps {
  flights: Flight[]
  onFiltersChange: (filtered: Flight[]) => void
  isOpen?: boolean
  onClose?: () => void
}

export function FlightFilters({ flights, onFiltersChange, isOpen = true, onClose }: FlightFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 15000])
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

  const handleFilterChange = (callback: () => void) => {
    callback()
    setTimeout(applyFilters, 0)
  }

  const toggleAirline = (airline: string) => {
    handleFilterChange(() => {
      setSelectedAirlines((prev) => (prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]))
    })
  }

  const toggleStop = (stop: string) => {
    handleFilterChange(() => {
      setSelectedStops((prev) => (prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]))
    })
  }

  const toggleTime = (time: string) => {
    handleFilterChange(() => {
      setSelectedTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]))
    })
  }

  const toggleDuration = (duration: string) => {
    handleFilterChange(() => {
      setSelectedDuration((prev) =>
        prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration],
      )
    })
  }

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange)
    handleFilterChange(() => {})
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
    setTimeout(applyFilters, 0)
  }

  if (!isOpen) return null

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-emerald-500/20 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Filters & Sort</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
          <label className="text-sm font-semibold text-slate-200 block mb-3">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy)
              handleFilterChange(() => {})
            }}
            className="w-full bg-slate-600 text-white border border-slate-500 rounded px-3 py-2 text-sm"
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration: Shortest First</option>
            <option value="departure">Departure Time</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition"
          >
            <span className="text-sm font-semibold text-slate-200">Price Range</span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition ${expandedSections.price ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSections.price && (
            <div className="mt-3 p-4 bg-slate-700/30 rounded-lg space-y-3">
              <input
                type="range"
                min="0"
                max="15000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-emerald-500"
              />
              <p className="text-sm text-emerald-400 font-semibold">
                ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("airlines")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition"
          >
            <span className="text-sm font-semibold text-slate-200">Airlines</span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition ${expandedSections.airlines ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSections.airlines && (
            <div className="mt-3 p-4 bg-slate-700/30 rounded-lg space-y-2">
              {airlines.map((airline) => (
                <label key={airline} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">{airline}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("stops")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition"
          >
            <span className="text-sm font-semibold text-slate-200">Stops</span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition ${expandedSections.stops ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSections.stops && (
            <div className="mt-3 p-4 bg-slate-700/30 rounded-lg space-y-2">
              {["Non-stop", "1 Stop", "2+ Stops"].map((stop) => (
                <label key={stop} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(stop)}
                    onChange={() => toggleStop(stop)}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">{stop}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("time")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition"
          >
            <span className="text-sm font-semibold text-slate-200">Departure Time</span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition ${expandedSections.time ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSections.time && (
            <div className="mt-3 p-4 bg-slate-700/30 rounded-lg space-y-2">
              {[
                { label: "Morning (6am - 12pm)", value: "Morning" },
                { label: "Afternoon (12pm - 6pm)", value: "Afternoon" },
                { label: "Evening (6pm - 12am)", value: "Evening" },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTimes.includes(value)}
                    onChange={() => toggleTime(value)}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("duration")}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition"
          >
            <span className="text-sm font-semibold text-slate-200">Flight Duration</span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition ${expandedSections.duration ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSections.duration && (
            <div className="mt-3 p-4 bg-slate-700/30 rounded-lg space-y-2">
              {[
                { label: "Up to 3 hours", value: "0-3" },
                { label: "3 to 6 hours", value: "3-6" },
                { label: "6+ hours", value: "6+" },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDuration.includes(value)}
                    onChange={() => toggleDuration(value)}
                    className="rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-600/50 transition font-medium text-sm"
      >
        Reset Filters
      </button>
    </div>
  )
}
