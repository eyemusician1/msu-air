"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plane, Calendar, MapPin, Users, CreditCard, CheckCircle2, Download, Printer, ArrowRight } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<Booking | null>(null)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (response.ok) {
          const bookingData = await response.json()
          setBooking(bookingData)

          const flightResponse = await fetch(`/api/flights/${bookingData.flightId}`)
          if (flightResponse.ok) {
            const flightData = await flightResponse.json()
            setFlight(flightData)
          }
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <a href="/search" className="text-emerald-600 hover:underline">
            Return to Search
          </a>
        </div>
      </div>
    )
  }

  const basePrice = flight.price
  const taxesPerSeat = 45
  const totalPrice = booking.totalPrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message - Hide when printing */}
        <div className="mb-8 text-center print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your flight reservation is complete. Check your email for details.</p>
        </div>

        {/* Action Buttons - Hide when printing */}
        <div className="flex gap-3 mb-8 print:hidden justify-center">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition border border-gray-200 shadow-sm"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Save PDF</span>
          </button>
        </div>

        {/* Receipt Card */}
        <div
          id="receipt"
          className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">BOOKING CONFIRMATION</p>
                <h2 className="text-2xl sm:text-3xl font-bold">Your Flight is Booked</h2>
              </div>
              <Plane size={40} className="opacity-80" />
            </div>

            {/* Booking Reference */}
            <div className="bg-emerald-500 bg-opacity-30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-emerald-100 text-xs font-medium mb-1">BOOKING REFERENCE</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{booking.bookingRef}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            {/* Flight Route Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">FROM</p>
                  <p className="text-3xl font-bold text-gray-900">{flight.from}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight className="text-emerald-600" size={24} />
                  <p className="text-xs text-gray-500 font-medium">{flight.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm font-medium mb-1">TO</p>
                  <p className="text-3xl font-bold text-gray-900">{flight.to}</p>
                </div>
              </div>
            </div>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
                  <Calendar size={14} /> DATE
                </p>
                <p className="text-gray-900 font-semibold">{flight.date}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2">DEPARTURE</p>
                <p className="text-gray-900 font-semibold">{flight.departure}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2">ARRIVAL</p>
                <p className="text-gray-900 font-semibold">{flight.arrival}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2">FLIGHT</p>
                <p className="text-gray-900 font-semibold">
                  {flight.airline} {flight.flightNumber}
                </p>
              </div>
            </div>

            {/* Seats Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                SEAT ASSIGNMENTS
              </h3>
              <div className="flex flex-wrap gap-2">
                {booking.selectedSeats.map((seat) => (
                  <div
                    key={seat}
                    className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-sm"
                  >
                    {seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers Section */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                PASSENGERS
              </h3>
              <div className="space-y-3">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{passenger.name}</p>
                      <p className="text-xs text-gray-600">{passenger.email}</p>
                    </div>
                    {passenger.seatAssignment && (
                      <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                        {passenger.seatAssignment}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                PRICE BREAKDOWN
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare ({booking.selectedSeats.length}x)</span>
                  <span className="text-gray-900 font-medium">₱{basePrice * booking.selectedSeats.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="text-gray-900 font-medium">₱{taxesPerSeat * booking.selectedSeats.length}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-600">₱{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-6 sm:px-8 py-6 border-t border-gray-200">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">IMPORTANT REMINDERS</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Arrive 2 hours before departure</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Bring valid government-issued ID</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Baggage: 1 carry-on (7kg) + 1 checked (23kg)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
              <p className="mb-1">
                For support: <span className="font-semibold text-gray-900">support@airline.com</span>
              </p>
              <p>+63 906 355 7013</p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard - Hide when printing */}
        <div className="mt-8 text-center print:hidden">
          <a
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition border border-gray-200 shadow-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
