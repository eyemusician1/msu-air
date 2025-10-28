"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function FlightSearch() {
  const [tripType, setTripType] = useState("roundtrip")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [departDate, setDepartDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (from && to && departDate) {
      const params = new URLSearchParams({
        from,
        to,
        departDate,
        tripType,
        passengers,
        ...(tripType === "roundtrip" && returnDate && { returnDate }),
      })
      router.push(`/flights?${params.toString()}`)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-emerald-500/20">
          <h2 className="text-3xl font-bold text-white mb-8">Search Flights</h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex gap-6 mb-8">
              <label className="flex items-center gap-3 text-white cursor-pointer group">
                <input
                  type="radio"
                  value="roundtrip"
                  checked={tripType === "roundtrip"}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="font-medium group-hover:text-emerald-400 transition">Round Trip</span>
              </label>
              <label className="flex items-center gap-3 text-white cursor-pointer group">
                <input
                  type="radio"
                  value="oneway"
                  checked={tripType === "oneway"}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="font-medium group-hover:text-emerald-400 transition">One Way</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                <label className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-semibold">
                  <MapPin size={18} /> From
                </label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-400 border-0 outline-none text-lg"
                  required
                />
              </div>

              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                <label className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-semibold">
                  <MapPin size={18} /> To
                </label>
                <input
                  type="text"
                  placeholder="Arrival city"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-400 border-0 outline-none text-lg"
                  required
                />
              </div>

              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                <label className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-semibold">
                  <Calendar size={18} /> Depart
                </label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent text-white border-0 outline-none text-lg"
                  required
                />
              </div>

              {tripType === "roundtrip" && (
                <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                  <label className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-semibold">
                    <Calendar size={18} /> Return
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-white border-0 outline-none text-lg"
                  />
                </div>
              )}

              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                <label className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-semibold">
                  <Users size={18} /> Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full bg-transparent text-white border-0 outline-none text-lg"
                >
                  <option value="1" className="bg-slate-800">
                    1 Passenger
                  </option>
                  <option value="2" className="bg-slate-800">
                    2 Passengers
                  </option>
                  <option value="3" className="bg-slate-800">
                    3 Passengers
                  </option>
                  <option value="4" className="bg-slate-800">
                    4+ Passengers
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition flex items-center justify-center gap-2 text-lg"
            >
              <Search size={20} /> Search Flights
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
