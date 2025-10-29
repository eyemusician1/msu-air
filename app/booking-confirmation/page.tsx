"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plane, Calendar, User, Mail, Phone, MapPin, CheckCircle, Download, Printer } from "lucide-react"
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
        // Fetch booking details
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (response.ok) {
          const bookingData = await response.json()
          setBooking(bookingData)

          // Fetch flight details
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
    // Simple print to PDF functionality
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking || !flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <a href="/search" className="text-blue-600 hover:underline">Return to Search</a>
        </div>
      </div>
    )
  }

  const basePrice = flight.price
  const taxesPerSeat = 45
  const totalPrice = booking.totalPrice

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message - Hide when printing */}
        <div className="mb-8 text-center print:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your flight has been successfully booked</p>
        </div>

        {/* Action Buttons - Hide when printing */}
        <div className="flex gap-4 mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Printer size={20} />
            Print Receipt
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            <Download size={20} />
            Save as PDF
          </button>
        </div>

        {/* Receipt Card */}
        <div id="receipt" className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Flight Booking Receipt</h2>
                <p className="text-blue-100">Thank you for choosing our airline</p>
              </div>
              <Plane size={48} className="opacity-80" />
            </div>
            <div className="border-t border-blue-500 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Booking Reference</p>
                  <p className="text-xl font-bold tracking-wider">{booking.bookingRef}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Booking Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plane className="text-blue-600" size={24} />
              Flight Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Flight Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {flight.airline} {flight.flightNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Route</p>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{flight.from}</p>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                      <Plane size={16} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 rotate-90" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{flight.to}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    {flight.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Departure Time</p>
                  <p className="text-lg font-semibold text-gray-900">{flight.departure}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Arrival Time</p>
                  <p className="text-lg font-semibold text-gray-900">{flight.arrival}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{flight.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Information */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Seat Assignments</h3>
            <div className="flex flex-wrap gap-3">
              {booking.selectedSeats.map((seat) => (
                <div
                  key={seat}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-lg"
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Information */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Passenger Details
            </h3>
            <div className="space-y-6">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      Passenger {index + 1}
                    </h4>
                    {passenger.seatAssignment && (
                      <span className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg">
                        Seat {passenger.seatAssignment}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <User size={14} />
                        Full Name
                      </p>
                      <p className="font-semibold text-gray-900">{passenger.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Mail size={14} />
                        Email
                      </p>
                      <p className="font-semibold text-gray-900">{passenger.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Phone size={14} />
                        Phone
                      </p>
                      <p className="font-semibold text-gray-900">{passenger.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-8 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Base Fare ({booking.selectedSeats.length} seat{booking.selectedSeats.length > 1 ? 's' : ''})</span>
                <span className="font-semibold">₱{basePrice * booking.selectedSeats.length}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Taxes & Fees</span>
                <span className="font-semibold">₱{taxesPerSeat * booking.selectedSeats.length}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-blue-600">₱{totalPrice}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <CheckCircle size={20} />
                Payment Status: Confirmed
              </p>
            </div>
          </div>

          {/* Important Information */}
          <div className="p-8 bg-blue-50 border-t-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Please arrive at the airport at least 2 hours before departure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Carry a valid government-issued photo ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Check-in opens 3 hours before departure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Baggage allowance: 1 carry-on (7kg) + 1 checked bag (23kg)</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-100 text-center text-sm text-gray-600">
            <p className="mb-2">For any queries or changes, please contact our customer service</p>
            <p className="font-semibold text-gray-900">support@airline.com | +63 906 355 7013</p>
            <p className="mt-4 text-xs text-gray-500">
              This is an electronic receipt. No signature required.
            </p>
          </div>
        </div>

        {/* Back to Dashboard - Hide when printing */}
        <div className="mt-8 text-center print:hidden">
          <a
            href="/dashboard"
            className="inline-block px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
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
        }
      `}</style>
    </div>
  )
}