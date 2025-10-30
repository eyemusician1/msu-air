"use client"

import { useState } from "react"
import { Calendar, MapPin, Users, Ticket, Clock, AlertCircle } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"

interface BookingCardProps {
  booking: Booking & { flight?: Flight }
}

export function BookingCard({ booking }: BookingCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const flight = booking.flight

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30"
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "✓"
      case "pending":
        return "⏳"
      case "cancelled":
        return "✕"
      case "completed":
        return "✓"
      default:
        return "•"
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden hover:border-emerald-500/30 transition">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {flight ? (
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {flight.from} → {flight.to}
                </h3>
                <p className="text-sm text-slate-400">
                  {flight.airline} • Flight {flight.flightNumber}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white">Flight {booking.flightId}</h3>
                <p className="text-sm text-slate-400">Flight details unavailable</p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${getStatusColor(
            booking.status,
          )}`}
        >
          <span>{getStatusIcon(booking.status)}</span>
          <span className="capitalize">{booking.status}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Flight Details */}
          {flight && (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Departure</p>
                    <p className="text-white font-semibold">{formatDate(flight.date)}</p>
                    <p className="text-sm text-slate-300">{formatTime(flight.departure)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Duration</p>
                    <p className="text-white font-semibold">{flight.duration}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Arrival</p>
                    <p className="text-white font-semibold">{formatTime(flight.arrival)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Price</p>
                    <p className="text-white font-semibold">₱{booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Booking Reference and Passengers */}
        <div className="border-t border-slate-700/50 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Booking Reference</p>
              <p className="text-lg font-mono font-semibold text-emerald-400">{booking.bookingRef}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Passengers</p>
              <p className="text-lg font-semibold text-white">{booking.passengers.length}</p>
            </div>
          </div>

          {/* Seats */}
          {booking.selectedSeats.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Seats</p>
              <div className="flex flex-wrap gap-2">
                {booking.selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded text-sm font-medium border border-emerald-500/30"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-700/50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-emerald-400 hover:text-emerald-300 transition font-semibold text-sm"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>

        {booking.status === "confirmed" && (
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-semibold text-sm">
            Manage Booking
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="bg-slate-900/30 px-6 py-6 border-t border-slate-700/50">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Passengers
              </h4>
              <div className="space-y-2">
                {booking.passengers.map((passenger, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-3 border border-slate-700/30">
                    <p className="text-white font-medium">{passenger.name}</p>
                    <p className="text-sm text-slate-400">{passenger.email}</p>
                    {passenger.phone && <p className="text-sm text-slate-400">{passenger.phone}</p>}
                  </div>
                ))}
              </div>
            </div>

            {booking.status === "cancelled" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold text-sm">This booking has been cancelled</p>
                  <p className="text-red-300/70 text-sm mt-1">Please contact support for refund information</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
