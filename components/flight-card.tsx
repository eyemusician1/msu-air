"use client"

import { Plane, Clock, Users, TrendingDown, Zap } from "lucide-react"
import Link from "next/link"
import type { Flight } from "@/lib/types"

interface FlightCardProps {
  flight: Flight
  isPopular?: boolean
}

export function FlightCard({ flight, isPopular }: FlightCardProps) {
  const getStopsLabel = (stops: string) => {
    if (stops === "Non-stop") return "Direct"
    return stops
  }

  const getPricePercentage = (price: number) => {
    // Calculate if this is a good deal (lower than average)
    const avgPrice = 5000
    return Math.round(((avgPrice - price) / avgPrice) * 100)
  }

  const pricePercentage = getPricePercentage(flight.price)
  const isGoodDeal = pricePercentage > 10

  return (
    <div
      className={`bg-slate-800 rounded-lg overflow-hidden shadow-lg border transition-all duration-300 ${
        isPopular
          ? "border-emerald-500/50 ring-2 ring-emerald-500/20 hover:ring-emerald-500/40"
          : "border-slate-700 hover:border-teal-500/50 hover:shadow-teal-500/10"
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-slate-900 text-xs font-bold flex items-center gap-2">
          <Zap size={14} /> Popular Choice
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          {/* Airline & Flight Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Plane size={18} className="text-emerald-400" />
              <span className="font-semibold text-white">{flight.airline}</span>
              <span className="text-sm text-slate-400">{flight.flightNumber}</span>
            </div>

            {/* Route & Times */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <p className="text-2xl font-bold text-white">{flight.departure}</p>
                <p className="text-xs text-slate-400 mt-1">Departure</p>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
                  <Clock size={16} className="text-slate-500 flex-shrink-0" />
                  <div className="flex-1 h-0.5 bg-gradient-to-l from-slate-700 to-transparent" />
                </div>
                <p className="text-xs text-slate-400 font-medium">{flight.duration}</p>
              </div>

              <div className="flex-shrink-0">
                <p className="text-2xl font-bold text-white">{flight.arrival}</p>
                <p className="text-xs text-slate-400 mt-1">Arrival</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-700/50 rounded">{getStopsLabel(flight.stops)}</span>
              <span className="px-2 py-1 bg-slate-700/50 rounded flex items-center gap-1">
                <Users size={12} /> {flight.seats} seats
              </span>
              {isGoodDeal && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1">
                  <TrendingDown size={12} /> Save {pricePercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-col items-end gap-3 md:flex-shrink-0">
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">₱{flight.price.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">per person</p>
            </div>
            <Link
              href={`/booking?flightId=${flight.id}`}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition font-semibold text-sm whitespace-nowrap"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
