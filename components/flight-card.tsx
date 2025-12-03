"use client"

import { Plane, Clock, MapPin, TrendingDown, Zap, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Flight } from "@/lib/types"
import { useRef } from "react"
import gsap from "gsap"

interface FlightCardProps {
  flight: Flight
  isPopular?: boolean
}

export function FlightCard({ flight, isPopular }: FlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isSoldOut = flight.seats === 0

  const handleHover = (isEnter: boolean) => {
    if (!isSoldOut) {
      gsap.to(cardRef.current, {
        y: isEnter ? -4 : 0,
        boxShadow: isEnter
          ? "0 20px 40px rgba(0, 0, 0, 0.4)"
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const getStopsLabel = (stops: string) => {
    if (stops === "Non-stop") return "Direct"
    return stops
  }

  const getPricePercentage = (price: number) => {
    const avgPrice = 5000
    return Math.round(((avgPrice - price) / avgPrice) * 100)
  }

  const pricePercentage = getPricePercentage(flight.price)
  const isGoodDeal = pricePercentage > 10 && !isSoldOut

  const CardContent = (
    <div
      ref={cardRef}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      className={`relative bg-slate-800/50 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        isSoldOut
          ? "border-slate-700/30 opacity-75 cursor-not-allowed"
          : "border-slate-700/50 hover:border-slate-600 cursor-pointer group"
      }`}
    >
      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">SOLD OUT</p>
            <p className="text-sm text-slate-400 mt-1">No seats available</p>
          </div>
        </div>
      )}

      {/* Popular Badge */}
      {isPopular && !isSoldOut && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
            <Zap className="w-3 h-3" />
            Popular
          </div>
        </div>
      )}

      {/* Good Deal Badge */}
      {isGoodDeal && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-bold text-white shadow-lg">
            <TrendingDown className="w-3 h-3" />
            {pricePercentage}% OFF
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Airline & Flight Number */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isSoldOut ? "bg-slate-700/30" : "bg-slate-700/50"
            }`}>
              <Plane className={`w-6 h-6 ${isSoldOut ? "text-slate-500" : "text-emerald-400"}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${isSoldOut ? "text-slate-400" : "text-white"}`}>
                {flight.airline}
              </p>
              <p className="text-xs text-slate-400">Flight {flight.flightNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Available Seats</p>
            <p className={`text-lg font-bold ${
              isSoldOut 
                ? "text-red-400" 
                : flight.seats <= 5 
                  ? "text-yellow-400" 
                  : "text-white"
            }`}>
              {flight.seats}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Departure */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className={`w-4 h-4 ${isSoldOut ? "text-slate-500" : "text-emerald-400"}`} />
              <span className="text-xs text-slate-400 uppercase">From</span>
            </div>
            <p className={`text-2xl font-bold ${isSoldOut ? "text-slate-400" : "text-white"}`}>
              {flight.from}
            </p>
            <p className="text-sm text-slate-400 mt-1">{flight.departure}</p>
          </div>

          {/* Duration & Stops */}
          <div className="flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-slate-500 mb-2" />
            <div className={`w-full h-0.5 rounded-full relative mb-2 ${
              isSoldOut 
                ? "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600" 
                : "bg-gradient-to-r from-emerald-500 via-slate-600 to-blue-500"
            }`}>
              <div className={`absolute -top-1.5 left-0 w-4 h-4 rounded-full ${
                isSoldOut ? "bg-slate-600" : "bg-emerald-500"
              }`} />
              <div className={`absolute -top-1.5 right-0 w-4 h-4 rounded-full ${
                isSoldOut ? "bg-slate-600" : "bg-blue-500"
              }`} />
            </div>
            <p className="text-xs text-slate-400 mb-1">{flight.duration}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              isSoldOut 
                ? "bg-slate-700/30 text-slate-500" 
                : "bg-slate-700/50 text-slate-400"
            }`}>
              {getStopsLabel(flight.stops || "Non-stop")}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-xs text-slate-400 uppercase">To</span>
              <MapPin className={`w-4 h-4 ${isSoldOut ? "text-slate-500" : "text-blue-400"}`} />
            </div>
            <p className={`text-2xl font-bold ${isSoldOut ? "text-slate-400" : "text-white"}`}>
              {flight.to}
            </p>
            <p className="text-sm text-slate-400 mt-1">{flight.arrival}</p>
          </div>
        </div>

        {/* Price & Book Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div>
            <p className="text-xs text-slate-400 mb-1">Price per person</p>
            <p className={`text-3xl font-bold ${
              isSoldOut ? "text-slate-500" : "text-emerald-400"
            }`}>
              ₱{flight.price.toLocaleString()}
            </p>
          </div>
          {isSoldOut ? (
            <div className="px-6 py-3 bg-slate-700/30 text-slate-500 font-semibold rounded-xl border border-slate-600/30 cursor-not-allowed">
              Not Available
            </div>
          ) : (
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25">
              Select Flight
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Low Availability Warning */}
        {!isSoldOut && flight.seats <= 5 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-yellow-400 font-semibold">
              Only {flight.seats} seat{flight.seats !== 1 ? "s" : ""} left!
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Only wrap in Link if not sold out
  if (isSoldOut) {
    return CardContent
  }

  return (
    <Link href={`/booking?flightId=${flight.id}`}>
      {CardContent}
    </Link>
  )
}
