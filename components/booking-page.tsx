"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Plane, Calendar, Users, ChevronRight, Check, AlertCircle, ArrowLeft, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Flight, Booking, Passenger } from "@/lib/types"
import gsap from "gsap"

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

  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null)
  const airplaneRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  // GSAP Animations
  useLayoutEffect(() => {
    if (!loading && flight) {
      const ctx = gsap.context(() => {
        gsap.from(stepsRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: "power3.out",
        })

        gsap.from(airplaneRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          delay: 0.2,
          ease: "back.out(1.7)",
        })

        gsap.from(summaryRef.current, {
          opacity: 0,
          x: 50,
          duration: 0.6,
          delay: 0.4,
          ease: "power3.out",
        })
      }, containerRef)

      return () => ctx.revert()
    }
  }, [loading, flight])

  // Seat selection animation
  const animateSeatSelection = (seatElement: HTMLElement, isSelecting: boolean) => {
    if (isSelecting) {
      gsap.fromTo(
        seatElement,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        }
      )
    }
  }

  // Fetch flight and reserved seats
  useEffect(() => {
    const fetchFlightData = async () => {
      if (!flightId) {
        setError("No flight selected")
        setLoading(false)
        return
      }

      try {
        const flightResponse = await fetch(`/api/flights/${flightId}`)
        if (!flightResponse.ok) throw new Error("Flight not found")
        const flightData = await flightResponse.json()
        setFlight(flightData)

        const seatsResponse = await fetch(`/api/flights/${flightId}/seats`)
        if (seatsResponse.ok) {
          const seatsData = await seatsResponse.json()
          setReservedSeats(seatsData.reservedSeats)
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

  // Refresh reserved seats when entering seat selection step
  useEffect(() => {
    if (step === "seats" && flight?.id) {
      const refreshSeats = async () => {
        try {
          const response = await fetch(`/api/flights/${flight.id}/seats`)
          if (response.ok) {
            const data = await response.json()
            setReservedSeats(data.reservedSeats)
          }
        } catch (error) {
          console.error("Error refreshing seats:", error)
        }
      }
      
      refreshSeats()
    }
  }, [step, flight?.id])

  const toggleSeat = (seatId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    animateSeatSelection(event.currentTarget, !selectedSeats.includes(seatId))
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    )
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
      alert(`Please add exactly ${selectedSeats.length} passengers for ${selectedSeats.length} seats`)
      return false
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.name.trim() || !p.email.trim() || !p.phone.trim()) {
        alert(`Please fill in all details for Passenger ${i + 1}`)
        return false
      }
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

  if (!validatePassengers()) return

  if (submitting) {
    console.log("Already submitting, please wait...")
    return
  }

  setSubmitting(true)
  setError(null)

  try {
    const passengersWithSeats = passengers.map((p, index) => ({
      name: p.name,
      email: p.email,
      phone: p.phone,
      seatAssignment: selectedSeats[index],
    }))

    const bookingData = {
      userId: user.uid,
      flightId: flight.id,
      passengers: passengersWithSeats,
      selectedSeats: selectedSeats,
      totalPrice: totalPrice,
      bookingRef: `${flight.flightNumber}-${Date.now()}`,
      status: "confirmed",
    }

    console.log("Sending booking data:", bookingData)

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    const data = await response.json()
    console.log("Response:", response.status, data)

    if (response.ok) {
      const bookingId = data.bookingId
      
      // Store complete booking data in sessionStorage as immediate backup
      const fullBookingData = {
        id: bookingId,
        ...bookingData,
        flight: {
          id: flight.id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          from: flight.from,
          to: flight.to,
          date: flight.date,
          departure: flight.departure,
          arrival: flight.arrival,
          duration: flight.duration,
          price: flight.price,
        },
        createdAt: new Date().toISOString(),
      }
      
      sessionStorage.setItem(`booking_${bookingId}`, JSON.stringify(fullBookingData))
      
      // Wait a bit longer to ensure Firestore write completes
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Navigate to confirmation page
      window.location.href = `/booking-confirmation?bookingId=${bookingId}`
    } else if (response.status === 409) {
      setError(`The following seats are no longer available: ${data.conflictingSeats?.join(", ")}`)
      
      try {
        const seatsResponse = await fetch(`/api/flights/${flight.id}/seats`)
        if (seatsResponse.ok) {
          const seatsData = await seatsResponse.json()
          setReservedSeats(seatsData.reservedSeats)
        }
      } catch (e) {
        console.error("Error refreshing seats:", e)
      }
      
      setSelectedSeats([])
      setStep("seats")
      alert(`Sorry, seat(s) ${data.conflictingSeats?.join(", ")} ${data.conflictingSeats?.length > 1 ? 'are' : 'is'} no longer available. Please select different seat(s).`)
    } else {
      const errorMessage = data.error || "Failed to complete booking. Please try again."
      setError(errorMessage)
      alert(errorMessage)
    }
  } catch (error: any) {
    console.error("Error completing booking:", error)
    setError("Network error. Please try again.")
    alert(`Network error: ${error.message}. Please check your connection and try again.`)
  } finally {
    setSubmitting(false)
  }
}


  // Seat component with airplane-style design and clear reserved state
  const Seat = ({ seatId, isReserved, isSelected, isExit = false }: { seatId: string; isReserved: boolean; isSelected: boolean; isExit?: boolean }) => {
    const row = seatId.slice(0, -1)
    const col = seatId.slice(-1)

    return (
      <button
        onClick={(e) => !isReserved && toggleSeat(seatId, e)}
        disabled={isReserved}
        className={`
          relative w-9 h-10 rounded-t-lg transition-all duration-200 flex items-center justify-center text-xs font-bold
          ${isReserved
            ? "bg-red-900/40 border-2 border-red-600/50 cursor-not-allowed"
            : isSelected
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105 border-2 border-emerald-400"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border-2 border-slate-600"
          }
          ${isExit ? "ring-2 ring-yellow-500/50" : ""}
        `}
        title={`Seat ${seatId}${isReserved ? " (Reserved - Unavailable)" : ""}`}
      >
        {/* Seat back visual */}
        <div className={`absolute -top-1 left-1 right-1 h-2 rounded-t-md ${
          isReserved ? "bg-red-900/60" : isSelected ? "bg-emerald-600" : "bg-slate-800"
        }`} />
        
        {/* Armrests */}
        <div className={`absolute top-2 -left-0.5 w-1 h-6 rounded-l ${
          isReserved ? "bg-red-900/60" : isSelected ? "bg-emerald-600" : "bg-slate-600"
        }`} />
        <div className={`absolute top-2 -right-0.5 w-1 h-6 rounded-r ${
          isReserved ? "bg-red-900/60" : isSelected ? "bg-emerald-600" : "bg-slate-600"
        }`} />
        
        {/* Seat label or lock icon for reserved */}
        {isReserved ? (
          <Lock className="w-3 h-3 text-red-400 relative z-10 mt-1" />
        ) : (
          <span className="relative z-10 mt-1">{col}</span>
        )}
      </button>
    )
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to book a flight</h2>
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Go to Login →
          </a>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
            <Plane className="absolute inset-0 m-auto w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-slate-400">Loading flight details...</p>
        </div>
      </section>
    )
  }

  if (error || !flight) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">{error || "Flight not found"}</h2>
          <a href="/flights" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Back to Flights →
          </a>
        </div>
      </section>
    )
  }

  const exitRows = [3, 7]
  const availableSeatsCount = flight.capacity - reservedSeats.length
  const rows = 10
  const seatsPerRow = ["A", "B", "C", "", "D", "E", "F"]

  return (
    <section ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div ref={stepsRef} className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { key: "seats", label: "Select Seats", icon: Users },
              { key: "passengers", label: "Passengers", icon: Users },
              { key: "confirm", label: "Confirm", icon: Check },
            ].map((s, idx) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    step === s.key
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <s.icon size={18} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < 2 && <ChevronRight className="w-5 h-5 text-slate-600 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Seat Selection */}
            {step === "seats" && (
              <div ref={airplaneRef} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 border-b border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-2">Select Your Seats</h2>
                  <p className="text-slate-400">
                    <span className="text-emerald-400 font-semibold">{availableSeatsCount}</span> of {flight.capacity} seats available
                  </p>
                </div>

                {/* Legend - Updated with distinct colors */}
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center py-5 bg-slate-900/50 border-b border-slate-700/50 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-8 bg-slate-700 border-2 border-slate-600 rounded-t-md" />
                    <span className="text-sm text-slate-300 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-8 bg-emerald-500 border-2 border-emerald-400 rounded-t-md shadow-lg shadow-emerald-500/30" />
                    <span className="text-sm text-slate-300 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-8 bg-red-900/40 border-2 border-red-600/50 rounded-t-md flex items-center justify-center">
                      <Lock className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm text-slate-300 font-medium">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-8 bg-slate-700 border-2 border-slate-600 rounded-t-md ring-2 ring-yellow-500/50" />
                    <span className="text-sm text-slate-300 font-medium">Exit Row</span>
                  </div>
                </div>

                {/* Airplane Cabin */}
                <div className="p-6 relative">
                  {/* Cockpit */}
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-full border-2 border-slate-600 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-slate-400 rotate-90" />
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="max-w-lg mx-auto space-y-2">
                    {/* Row Labels */}
                    <div className="flex justify-center gap-1 mb-2">
                      <div className="w-8 h-6 text-xs text-slate-500 flex items-center justify-center"></div>
                      {seatsPerRow.map((col, idx) => (
                        <div key={idx} className="w-9 h-6 text-xs text-slate-400 flex items-center justify-center font-semibold">
                          {col}
                        </div>
                      ))}
                    </div>

                    {Array.from({ length: rows }, (_, rowIndex) => {
                      const rowNumber = rowIndex + 1
                      const isExitRow = exitRows.includes(rowNumber)

                      return (
                        <div key={rowNumber} className="flex items-center justify-center gap-1 relative">
                          {/* Row number */}
                          <div className="w-8 h-10 text-xs text-slate-500 flex items-center justify-center font-semibold">
                            {rowNumber}
                          </div>

                          {seatsPerRow.map((col, colIndex) => {
                            if (col === "") {
                              return <div key={`aisle-${colIndex}`} className="w-9 h-10"></div>
                            }

                            const seatId = `${rowNumber}${col}`
                            const isReserved = reservedSeats.includes(seatId)
                            const isSelected = selectedSeats.includes(seatId)

                            return (
                              <Seat
                                key={seatId}
                                seatId={seatId}
                                isReserved={isReserved}
                                isSelected={isSelected}
                                isExit={isExitRow}
                              />
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>

                  {/* Selected Seats Display */}
                  {selectedSeats.length > 0 && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <p className="text-emerald-400 font-semibold mb-2">Selected Seats:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.sort().map((seat) => (
                          <span key={seat} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-semibold">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
                  <div className="flex gap-4">
                    <a
                      href="/flights"
                      className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-center font-semibold"
                    >
                      Cancel
                    </a>
                    <button
                      onClick={() => {
                        if (selectedSeats.length === 0) {
                          alert("Please select at least one seat")
                          return
                        }
                        setPassengers(
                          Array.from({ length: selectedSeats.length }, () => ({
                            name: "",
                            email: "",
                            phone: "",
                          }))
                        )
                        setStep("passengers")
                      }}
                      disabled={selectedSeats.length === 0}
                      className={`flex-1 py-3 rounded-xl transition-all font-semibold ${
                        selectedSeats.length === 0
                          ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                      }`}
                    >
                      Continue to Passengers
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger Information */}
            {step === "passengers" && (
              <div ref={airplaneRef} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 border-b border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-2">Passenger Details</h2>
                  <p className="text-slate-400">
                    Please provide details for {selectedSeats.length} passenger(s)
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <span className="text-emerald-400 font-bold">{index + 1}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">
                            Passenger {index + 1}
                          </h3>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
                          Seat {selectedSeats[index]}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, "name", e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, "email", e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                            placeholder="+63 912 345 6789"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep("seats")}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (validatePassengers()) {
                          setStep("confirm")
                        }
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/25"
                    >
                      Continue to Confirmation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation */}
            {step === "confirm" && (
              <div ref={airplaneRef} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 border-b border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Booking</h2>
                  <p className="text-slate-400">Review your details before confirming</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Flight Details */}
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-emerald-400" />
                      Flight Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Flight</p>
                        <p className="text-white font-semibold">
                          {flight.airline} {flight.flightNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Route</p>
                        <p className="text-white font-semibold">
                          {flight.from} → {flight.to}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Date</p>
                        <p className="text-white font-semibold">{flight.date}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Time</p>
                        <p className="text-white font-semibold">
                          {flight.departure} - {flight.arrival}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Selected Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.sort().map((seat) => (
                        <span key={seat} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      Passengers
                    </h3>
                    <div className="space-y-4">
                      {passengers.map((passenger, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                          <div>
                            <p className="text-white font-semibold">{passenger.name}</p>
                            <p className="text-sm text-slate-400">
                              {passenger.email} • {passenger.phone}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
                            Seat {selectedSeats[index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep("passengers")}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCompleteBooking}
                      disabled={submitting}
                      className={`flex-1 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                        submitting
                          ? "bg-slate-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25 hover:shadow-emerald-500/40"
                      } text-white`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Complete Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div ref={summaryRef} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

              {/* Flight Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Flight {flight.flightNumber}</p>
                    <p className="text-white font-semibold">
                      {flight.from} → {flight.to}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{flight.date}</p>
                    <p className="text-white font-semibold">
                      {flight.departure} - {flight.arrival}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">
                      {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-white font-semibold">
                      {selectedSeats.length > 0 ? selectedSeats.sort().join(", ") : "No seats selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-700/50 pt-6 space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Base Fare ({selectedSeats.length}x)</span>
                  <span>₱{(basePrice * selectedSeats.length).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxes & Fees</span>
                  <span>₱{(taxesPerSeat * selectedSeats.length).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-slate-700/50">
                  <span>Total</span>
                  <span className="text-emerald-400">₱{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 text-center">
                  By confirming, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
