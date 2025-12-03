"use client"

import type React from "react"
import { useState, useRef, useLayoutEffect } from "react"
import { Search, MapPin, Calendar, Users, ArrowRightLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import gsap from "gsap"

export function FlightSearch() {
  const [tripType, setTripType] = useState("roundtrip")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [departDate, setDepartDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const router = useRouter()

  // Animation refs
  const formRef = useRef<HTMLFormElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const fieldsRef = useRef<(HTMLDivElement | null)[]>([])

  // Initial animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power3.out",
      })

      gsap.from(fieldsRef.current.filter(Boolean), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.2,
        ease: "power2.out",
      })
    }, formRef)

    return () => ctx.revert()
  }, [])

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

  const swapLocations = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form ref={formRef} onSubmit={handleSearch} className="space-y-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Find Your Perfect Flight
          </h1>
          <p className="text-slate-400 text-lg">Search and compare flights from top airlines</p>
        </div>

        {/* Search Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Trip Type */}
          <div ref={(el) => { fieldsRef.current[0] = el }} className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="roundtrip"
                checked={tripType === "roundtrip"}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors font-medium">
                Round Trip
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="oneway"
                checked={tripType === "oneway"}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors font-medium">
                One Way
              </span>
            </label>
          </div>

          {/* Main Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* From */}
            <div ref={(el) => { fieldsRef.current[1] = el }} className="relative">
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  From
                </label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-transparent text-white placeholder-slate-500 border-0 outline-none text-lg font-semibold"
                  required
                />
              </div>
            </div>

            {/* Swap Button (only visible on larger screens) */}
            <div className="hidden lg:flex items-center justify-center -mx-8 relative z-10">
              <button
                type="button"
                onClick={swapLocations}
                className="w-12 h-12 bg-slate-700 hover:bg-emerald-500 border-2 border-slate-600 hover:border-emerald-400 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-180"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div ref={(el) => { fieldsRef.current[2] = el }} className="relative">
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  To
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-transparent text-white placeholder-slate-500 border-0 outline-none text-lg font-semibold"
                  required
                />
              </div>
            </div>

            {/* Depart Date */}
            <div ref={(el) => { fieldsRef.current[3] = el }} className="relative">
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  Depart
                </label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent text-white border-0 outline-none text-lg font-semibold [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Return Date & Passengers Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Return Date */}
            {tripType === "roundtrip" && (
              <div ref={(el) => { fieldsRef.current[4] = el }} className="relative">
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    Return
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-white border-0 outline-none text-lg font-semibold [color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            {/* Passengers */}
            <div ref={(el) => { fieldsRef.current[5] = el }} className={tripType === "roundtrip" ? "" : "md:col-span-2"}>
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Users className="w-4 h-4" />
                  Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full bg-transparent text-white border-0 outline-none text-lg font-semibold cursor-pointer"
                >
                  <option value="1" className="bg-slate-800">1 Passenger</option>
                  <option value="2" className="bg-slate-800">2 Passengers</option>
                  <option value="3" className="bg-slate-800">3 Passengers</option>
                  <option value="4+" className="bg-slate-800">4+ Passengers</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div ref={(el) => { fieldsRef.current[6] = el }} className={tripType === "roundtrip" ? "" : ""}>
              <button
                type="submit"
                className="w-full h-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Flights
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="px-3 py-1 bg-slate-700/30 rounded-full"> Book early for better prices</span>
            <span className="px-3 py-1 bg-slate-700/30 rounded-full"> Compare multiple airlines</span>
            <span className="px-3 py-1 bg-slate-700/30 rounded-full"> Flexible dates save money</span>
          </div>
        </div>
      </form>
    </div>
  )
}
