"use client"

import { useState } from "react"
import { Filter, Clock, Users, Plane } from "lucide-react"
import Link from "next/link"

const mockFlights = [
  {
    id: 1,
    airline: "SkyWings",
    flightNumber: "SW101",
    departure: "08:00",
    arrival: "12:30",
    duration: "4h 30m",
    price: 299,
    seats: 12,
    stops: "Non-stop",
    from: "JFK",
    to: "LAX",
  },
  {
    id: 2,
    airline: "AeroFly",
    flightNumber: "AF205",
    departure: "10:15",
    arrival: "15:45",
    duration: "5h 30m",
    price: 249,
    seats: 8,
    stops: "Non-stop",
    from: "JFK",
    to: "LAX",
  },
  {
    id: 3,
    airline: "CloudJet",
    flightNumber: "CJ312",
    departure: "14:00",
    arrival: "19:20",
    duration: "5h 20m",
    price: 199,
    seats: 15,
    stops: "1 Stop",
    from: "JFK",
    to: "LAX",
  },
  {
    id: 4,
    airline: "SkyWings",
    flightNumber: "SW405",
    departure: "16:30",
    arrival: "21:00",
    duration: "4h 30m",
    price: 329,
    seats: 5,
    stops: "Non-stop",
    from: "JFK",
    to: "LAX",
  },
]

export function FlightResults() {
  const [priceFilter, setPriceFilter] = useState(500)
  const [selectedStops, setSelectedStops] = useState<string[]>(["Non-stop", "1 Stop"])
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["Morning", "Afternoon", "Evening"])

  const filteredFlights = mockFlights.filter((flight) => {
    if (flight.price > priceFilter) return false
    if (!selectedStops.includes(flight.stops)) return false

    const hour = Number.parseInt(flight.departure.split(":")[0])
    const timeOfDay = hour >= 6 && hour < 12 ? "Morning" : hour >= 12 && hour < 18 ? "Afternoon" : "Evening"
    if (!selectedTimes.includes(timeOfDay)) return false

    return true
  })

  const toggleStop = (stop: string) => {
    setSelectedStops((prev) => (prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]))
  }

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]))
  }

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flight Results</h1>
          <p className="text-slate-300">New York (JFK) → Los Angeles (LAX) • Dec 15, 2024 • 1 Passenger</p>
          <p className="text-sm text-slate-400 mt-2">{filteredFlights.length} flights found</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-emerald-500/20 sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-emerald-400" />
                <h3 className="font-semibold text-white">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-3 block">Price Range</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-sm text-emerald-400 mt-2 font-semibold">Up to ${priceFilter}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-3 block">Stops</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStops.includes("Non-stop")}
                        onChange={() => toggleStop("Non-stop")}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-sm text-slate-300">Non-stop</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStops.includes("1 Stop")}
                        onChange={() => toggleStop("1 Stop")}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-sm text-slate-300">1 Stop</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-3 block">Departure Time</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes("Morning")}
                        onChange={() => toggleTime("Morning")}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-sm text-slate-300">Morning (6am - 12pm)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes("Afternoon")}
                        onChange={() => toggleTime("Afternoon")}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-sm text-slate-300">Afternoon (12pm - 6pm)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes("Evening")}
                        onChange={() => toggleTime("Evening")}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-sm text-slate-300">Evening (6pm - 12am)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Cards */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700 hover:border-teal-500/50 hover:shadow-teal-500/10 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Plane size={18} className="text-emerald-400" />
                        <span className="font-semibold text-white">{flight.airline}</span>
                        <span className="text-sm text-slate-400">{flight.flightNumber}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <p className="text-2xl font-bold text-white">{flight.departure}</p>
                          <p className="text-sm text-slate-400">Departure</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-0.5 bg-slate-700" />
                          <Clock size={16} className="text-slate-500" />
                          <div className="flex-1 h-0.5 bg-slate-700" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{flight.arrival}</p>
                          <p className="text-sm text-slate-400">Arrival</p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-slate-400">
                        <span>{flight.duration}</span>
                        <span>•</span>
                        <span>{flight.stops}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {flight.seats} seats left
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div>
                        <p className="text-3xl font-bold text-emerald-400">${flight.price}</p>
                        <p className="text-sm text-slate-400">per person</p>
                      </div>
                      <Link
                        href={`/booking?flightId=${flight.id}`}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition font-semibold"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
                <p className="text-slate-300 text-lg">No flights match your filters. Try adjusting your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
