"use client"

import { useState, useEffect } from "react"
import { X, Plane, MapPin, Calendar, Clock, DollarSign, Users } from "lucide-react"

// Import your Flight type from your types file
import type { Flight } from "@/lib/types"

interface FlightDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (flight: Partial<Flight>) => Promise<void>
  flight?: Flight | null
  mode: "add" | "edit"
}

export function FlightDialog({ isOpen, onClose, onSubmit, flight, mode }: FlightDialogProps) {
  const [formData, setFormData] = useState<Partial<Flight>>({
    flightNumber: "",
    airline: "",
    from: "",
    to: "",
    date: "",
    departure: "",
    arrival: "",
    duration: "",
    price: 0,
    capacity: 0,
    seats: 0,
    booked: 0,
    stops: "Non-stop"
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (flight && mode === "edit") {
      setFormData({
        flightNumber: flight.flightNumber || "",
        airline: flight.airline || "",
        from: flight.from || "",
        to: flight.to || "",
        date: flight.date || "",
        departure: flight.departure || "",
        arrival: flight.arrival || "",
        duration: flight.duration || "",
        price: flight.price || 0,
        capacity: flight.capacity || 0,
        seats: flight.seats || 0,
        booked: flight.booked || 0,
        stops: flight.stops || "Non-stop"
      })
    } else {
      setFormData({
        flightNumber: "",
        airline: "",
        from: "",
        to: "",
        date: "",
        departure: "",
        arrival: "",
        duration: "",
        price: 0,
        capacity: 0,
        seats: 0,
        booked: 0,
        stops: "Non-stop"
      })
    }
    setErrors({})
  }, [flight, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.flightNumber?.trim()) newErrors.flightNumber = "Flight number is required"
    if (!formData.airline?.trim()) newErrors.airline = "Airline is required"
    if (!formData.from?.trim()) newErrors.from = "Origin is required"
    if (!formData.to?.trim()) newErrors.to = "Destination is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.departure) newErrors.departure = "Departure time is required"
    if (!formData.arrival) newErrors.arrival = "Arrival time is required"
    if (!formData.duration?.trim()) newErrors.duration = "Duration is required"
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Calculate seats based on capacity and booked
      const finalData = {
        ...formData,
        seats: (formData.capacity || 0) - (formData.booked || 0)
      }
      
      await onSubmit(finalData)
      onClose()
    } catch (error) {
      console.error("Error submitting flight:", error)
      alert("Failed to save flight. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof Flight, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {mode === "add" ? "Add New Flight" : "Edit Flight"}
              </h2>
              <p className="text-slate-400 text-sm">
                {mode === "add" ? "Create a new flight entry" : "Update flight information"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Flight Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-emerald-400" />
              Flight Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Flight Number *
                </label>
                <input
                  type="text"
                  value={formData.flightNumber || ""}
                  onChange={(e) => handleChange("flightNumber", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.flightNumber ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., N127"
                />
                {errors.flightNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.flightNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Airline *
                </label>
                <input
                  type="text"
                  value={formData.airline || ""}
                  onChange={(e) => handleChange("airline", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.airline ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., Cebu Pacific"
                />
                {errors.airline && (
                  <p className="text-red-400 text-sm mt-1">{errors.airline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Route Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  From *
                </label>
                <input
                  type="text"
                  value={formData.from || ""}
                  onChange={(e) => handleChange("from", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.from ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., Manila"
                />
                {errors.from && (
                  <p className="text-red-400 text-sm mt-1">{errors.from}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  To *
                </label>
                <input
                  type="text"
                  value={formData.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.to ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., Cebu"
                />
                {errors.to && (
                  <p className="text-red-400 text-sm mt-1">{errors.to}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Schedule Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.date ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white focus:outline-none focus:border-emerald-500 transition`}
                />
                {errors.date && (
                  <p className="text-red-400 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Departure *
                </label>
                <input
                  type="time"
                  value={formData.departure || ""}
                  onChange={(e) => handleChange("departure", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.departure ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white focus:outline-none focus:border-emerald-500 transition`}
                />
                {errors.departure && (
                  <p className="text-red-400 text-sm mt-1">{errors.departure}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Arrival *
                </label>
                <input
                  type="time"
                  value={formData.arrival || ""}
                  onChange={(e) => handleChange("arrival", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.arrival ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white focus:outline-none focus:border-emerald-500 transition`}
                />
                {errors.arrival && (
                  <p className="text-red-400 text-sm mt-1">{errors.arrival}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration || ""}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.duration ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., 1h 30m"
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-1">{errors.duration}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Pricing & Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Price (₱) *
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.price ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., 2500"
                  min="0"
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity || 0}
                  onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border ${
                    errors.capacity ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
                  placeholder="e.g., 180"
                  min="1"
                />
                {errors.capacity && (
                  <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Booked Seats
                </label>
                <input
                  type="number"
                  value={formData.booked || 0}
                  onChange={(e) => handleChange("booked", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="e.g., 45"
                  min="0"
                  disabled={mode === "add"}
                />
                {mode === "add" && (
                  <p className="text-slate-500 text-xs mt-1">Set to 0 for new flights</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </span>
              ) : (
                mode === "add" ? "Create Flight" : "Update Flight"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}