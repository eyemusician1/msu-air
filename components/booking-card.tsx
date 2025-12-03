"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, MapPin, Users, Ticket, Clock, AlertCircle, ChevronDown, Plane } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"
import gsap from "gsap"

interface BookingCardProps {
  booking: Booking & { flight?: Flight }
}

export function BookingCard({ booking }: BookingCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const flight = booking.flight

  // Expand/collapse animation
  useEffect(() => {
    if (detailsRef.current) {
      if (showDetails) {
        gsap.to(detailsRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      } else {
        gsap.to(detailsRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
      }
    }
  }, [showDetails])

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

  if (!flight) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 text-slate-400">
          <AlertCircle className="w-5 h-5" />
          <p>Flight details unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300"
    >
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {flight.airline} • Flight {flight.flightNumber}
              </h3>
              <p className="text-sm text-slate-400">{booking.bookingRef}</p>
            </div>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(
              booking.status
            )}`}
          >
            {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
          </span>
        </div>

        {/* Flight Route */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Departure</span>
            </div>
            <p className="text-lg font-bold text-white">{flight.from}</p>
            <p className="text-sm text-slate-400">{formatDate(flight.date)}</p>
            <p className="text-sm text-slate-400">{formatTime(flight.departure)}</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-slate-500 mb-1" />
            <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/50 via-slate-600 to-emerald-500/50 rounded-full relative">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{flight.duration}</p>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-xs text-slate-400">Arrival</span>
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-white">{flight.to}</p>
            <p className="text-sm text-slate-400">{formatDate(flight.date)}</p>
            <p className="text-sm text-slate-400">{formatTime(flight.arrival)}</p>
          </div>
        </div>

        {/* Bottom Info Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-sm font-semibold text-white">₱{booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Passengers</p>
                <p className="text-sm font-semibold text-white">{booking.passengers.length}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-all duration-200"
          >
            <span className="text-sm font-medium">
              {showDetails ? "Hide Details" : "View Details"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                showDetails ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div ref={detailsRef} className="h-0 opacity-0 overflow-hidden">
        <div className="px-6 pb-6 pt-2 border-t border-slate-700/50 bg-slate-900/30">
          {/* Passengers */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Passenger Details
            </h4>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{passenger.name}</p>
                    <p className="text-xs text-slate-400">{passenger.email}</p>
                    {passenger.phone && (
                      <p className="text-xs text-slate-500">{passenger.phone}</p>
                    )}
                  </div>
                  {passenger.seatAssignment && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
                      Seat {passenger.seatAssignment}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seats */}
          {booking.selectedSeats && booking.selectedSeats.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Seat Assignments</h4>
              <div className="flex flex-wrap gap-2">
                {booking.selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Notice */}
          {booking.status === "cancelled" && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">This booking has been cancelled</p>
                <p className="text-xs text-red-300 mt-1">
                  Please contact support for refund information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
