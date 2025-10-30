// components/booking-page.tsx - FIRESTORE INTEGRATED VERSION
"use client"

import { useState, useEffect } from "react"
import { Plane, Calendar, Armchair, User } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Flight, Booking, Passenger } from "@/lib/types"

export function BookingPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const flightId = searchParams.get("flightId")

  const [flight, setFlight] = useState<Flight | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([{ name: "", email: "", phone: "" }])
  const [step, setStep] = useState<"seats" | "passengers" | "confirm">("seats")
  const [loading, setLoading] = useState(true)
  const [reservedSeats, setReservedSeats] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch flight and reserved seats
  useEffect(() => {
    const fetchFlightData = async () => {
      if (!flightId) {
        setError("No flight selected")
        setLoading(false)
        return
      }
      
      try {
        // Fetch flight details
        const flightResponse = await fetch(`/api/flights/${flightId}`)
        if (!flightResponse.ok) {
          throw new Error("Flight not found")
        }
        const flightData = await flightResponse.json()
        setFlight(flightData)

        // Fetch reserved seats
        const seatsResponse = await fetch(`/api/flights/${flightId}/seats`)
        if (seatsResponse.ok) {
          const seatsData = await seatsResponse.json()
          setReservedSeats(seatsData.reservedSeats || [])
        }
      } catch (error) {
        console.error("Error fetching flight data:", error)
        setError("Failed to load flight details")
      } finally {
        setLoading(false)
      }
    }

    fetchFlightData()
  }, [flightId])

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) => (prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]))
  }

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
  }

  const addPassenger = () => {
    if (passengers.length < selectedSeats.length) {
      setPassengers([...passengers, { name: "", email: "", phone: "" }])
    } else {
      alert("You can only add passengers up to the number of selected seats")
    }
  }

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const validatePassengers = () => {
    if (passengers.length !== selectedSeats.length) {
      alert(`Please add exactly ${selectedSeats.length} passenger(s) for ${selectedSeats.length} seat(s)`)
      return false
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.name.trim() || !p.email.trim() || !p.phone.trim()) {
        alert(`Please fill in all details for Passenger ${i + 1}`)
        return false
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(p.email)) {
        alert(`Please enter a valid email for Passenger ${i + 1}`)
        return false
      }
    }

    return true
  }

  const basePrice = flight?.price || 299
  const taxesPerSeat = 45
  const totalPrice = (basePrice + taxesPerSeat) * selectedSeats.length

  const handleCompleteBooking = async () => {
    if (!user?.uid || !flight) {
      alert("Please log in to complete booking")
      return
    }

    if (!validatePassengers()) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Map passengers to include seat assignments
      const passengersWithSeats: Passenger[] = passengers.map((p, index) => ({
        ...p,
        seatAssignment: selectedSeats[index]
      }))

      const bookingData = {
        userId: user.uid,
        flightId: flight.id,
        passengers: passengersWithSeats,
        selectedSeats: selectedSeats,
        totalPrice,
        bookingRef: `${flight.flightNumber}-${Date.now()}`,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to confirmation page with booking ID
        window.location.href = `/booking-confirmation?bookingId=${data.bookingId}`
      } else if (response.status === 409) {
        // Seat conflict
        alert(`Sorry, the following seats are no longer available: ${data.conflictingSeats?.join(", ") || "some seats"}. Please select different seats.`)
        setStep("seats")
        // Refresh reserved seats
        const seatsResponse = await fetch(`/api/flights/${flightId}/seats`)
        if (seatsResponse.ok) {
          const seatsData = await seatsResponse.json()
          setReservedSeats(seatsData.reservedSeats || [])
        }
        setSelectedSeats([])
      } else {
        alert(data.error || "Failed to complete booking. Please try again.")
      }
    } catch (error) {
      console.error("Error completing booking:", error)
      alert("Failed to complete booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to book a flight</h2>
            <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading flight details...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !flight) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || "Flight not found"}</h2>
            <a href="/search" className="text-blue-600 hover:underline">Back to Search</a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8 flex justify-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              step === "seats" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Armchair size={18} /> Seats
          </div>
          <div className="text-gray-400">→</div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              step === "passengers" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <User size={18} /> Passengers
          </div>
          <div className="text-gray-400">→</div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              step === "confirm" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Confirm
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "seats" && (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Seats</h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Available Seats:</span> {flight.seats} of {flight.capacity}
                  </p>
                </div>

                <div className="mb-8 flex gap-6 justify-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded border border-gray-300" />
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded border border-blue-700" />
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded border border-gray-500" />
                    <span className="text-sm text-gray-600">Reserved</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                  <div className="text-center mb-6 text-sm font-semibold text-gray-600">FRONT OF AIRCRAFT</div>

                  <div className="grid gap-4 max-w-md mx-auto">
                    {Array.from({ length: 10 }).map((_, rowIdx) => (
                      <div key={rowIdx} className="flex gap-2 justify-center items-center">
                        <span className="w-6 text-center text-xs font-semibold text-gray-500">{rowIdx + 1}</span>
                        <div className="flex gap-2">
                          {Array.from({ length: 6 }).map((_, colIdx) => {
                            const seatId = `${rowIdx + 1}${String.fromCharCode(65 + colIdx)}`
                            const isReserved = reservedSeats.includes(seatId)
                            const isSelected = selectedSeats.includes(seatId)

                            return (
                              <button
                                key={seatId}
                                onClick={() => !isReserved && toggleSeat(seatId)}
                                disabled={isReserved}
                                className={`w-6 h-6 rounded border transition ${
                                  isReserved
                                    ? "bg-gray-400 border-gray-500 cursor-not-allowed"
                                    : isSelected
                                      ? "bg-blue-600 border-blue-700 hover:bg-blue-700"
                                      : "bg-gray-200 border-gray-300 hover:bg-gray-300"
                                }`}
                                title={seatId}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-6 text-sm font-semibold text-gray-600">BACK OF AIRCRAFT</div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Selected Seats:</span> {selectedSeats.join(", ")}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setStep("passengers")}
                  disabled={selectedSeats.length === 0}
                  className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue to Passenger Details
                </button>
              </div>
            )}

            {step === "passengers" && (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Information</h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Please provide details for <span className="font-semibold">{selectedSeats.length} passenger(s)</span>
                  </p>
                </div>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Passenger {index + 1} {selectedSeats[index] && `- Seat ${selectedSeats[index]}`}
                        </h3>
                        {passengers.length > 1 && index >= 1 && (
                          <button
                            onClick={() => removePassenger(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, "name", e.target.value)}
                            placeholder="Your Name"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, "email", e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                            placeholder="+63 123 456 7890"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {passengers.length < selectedSeats.length && (
                  <button
                    onClick={addPassenger}
                    className="mt-6 w-full py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                  >
                    + Add Another Passenger
                  </button>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep("seats")}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (validatePassengers()) {
                        setStep("confirm")
                      }
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Review Booking
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Flight Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Flight:</span> {flight.airline} {flight.flightNumber}
                      </p>
                      <p>
                        <span className="font-semibold">Route:</span> {flight.from} → {flight.to}
                      </p>
                      <p>
                        <span className="font-semibold">Date:</span> {flight.date}
                      </p>
                      <p>
                        <span className="font-semibold">Time:</span> {flight.departure} - {flight.arrival}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Seats</h3>
                    <p className="text-sm text-gray-700">{selectedSeats.join(", ")}</p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Passengers</h3>
                    <div className="space-y-2">
                      {passengers.map((passenger, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <p className="font-semibold">
                            Passenger {index + 1} - Seat {selectedSeats[index]}
                          </p>
                          <p>{passenger.name}</p>
                          <p className="text-gray-600">{passenger.email} • {passenger.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep("passengers")}
                    disabled={submitting}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCompleteBooking}
                    disabled={submitting}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      "Complete Booking"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <Plane size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {flight.airline} {flight.flightNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {flight.from} → {flight.to}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{flight.date}</p>
                    <p className="text-sm text-gray-600">
                      {flight.departure} - {flight.arrival}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Armchair size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "No seats selected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Base Fare ({selectedSeats.length || 1}x)</span>
                  <span>₱{basePrice * (selectedSeats.length || 1)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes & Fees</span>
                  <span>₱{taxesPerSeat * (selectedSeats.length || 1)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">₱{totalPrice}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">By confirming, you agree to our terms and conditions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}