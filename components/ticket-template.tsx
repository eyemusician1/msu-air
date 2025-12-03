import { Plane, MapPin, Users, QrCode } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"

interface TicketTemplateProps {
  booking: Booking
  flight: Flight
  forDownload?: boolean
}

export function TicketTemplate({ booking, flight, forDownload = false }: TicketTemplateProps) {
  return (
    <div 
      id="ticket-template"
      className={`bg-white ${forDownload ? 'w-[800px]' : 'w-full'} mx-auto`}
      style={{ 
        fontFamily: 'Arial, sans-serif',
        color: '#1e293b'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Skyrithm Airlines</h1>
              <p className="text-sm opacity-90">E-Ticket</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Booking Reference</p>
            <p className="text-xl font-bold tracking-wider">{booking.bookingRef}</p>
          </div>
        </div>
      </div>

      {/* Flight Route */}
      <div className="p-6 bg-slate-50 border-b-4 border-dashed border-slate-300">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Departure */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-600 uppercase font-semibold">Departure</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{flight.from}</p>
            <p className="text-sm text-slate-600 mt-1">{flight.date}</p>
            <p className="text-lg font-semibold text-emerald-600 mt-1">{flight.departure}</p>
          </div>

          {/* Duration */}
          <div className="text-center">
            <Plane className="w-6 h-6 text-slate-400 mx-auto mb-2 rotate-90" />
            <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-slate-400 to-blue-500 relative">
              <div className="absolute -top-1.5 left-0 w-4 h-4 bg-emerald-500 rounded-full" />
              <div className="absolute -top-1.5 right-0 w-4 h-4 bg-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-600 mt-2 font-semibold">{flight.duration}</p>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-xs text-slate-600 uppercase font-semibold">Arrival</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{flight.to}</p>
            <p className="text-sm text-slate-600 mt-1">{flight.date}</p>
            <p className="text-lg font-semibold text-blue-600 mt-1">{flight.arrival}</p>
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="p-6 bg-white">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Flight Number</p>
              <p className="font-bold text-slate-900">{flight.airline} {flight.flightNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Passengers</p>
              <p className="font-bold text-slate-900">{booking.passengers.length}</p>
            </div>
          </div>
        </div>

        {/* Passenger List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2">Passenger Details</h3>
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{passenger.name}</p>
                  <p className="text-xs text-slate-600">{passenger.email}</p>
                </div>
              </div>
              {passenger.seatAssignment && (
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg">
                  <p className="text-xs font-semibold">SEAT</p>
                  <p className="text-lg font-bold">{passenger.seatAssignment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="p-6 bg-slate-50 border-t-2 border-dashed border-slate-300">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-semibold">Total Amount Paid</span>
          <span className="text-2xl font-bold text-emerald-600">₱{booking.totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-900 text-white text-center">
        <p className="text-xs opacity-80">Please arrive at the airport at least 2 hours before departure</p>
        <p className="text-xs mt-1 opacity-60">support@skyrithm.com • +63 906 355 7013</p>
      </div>
    </div>
  )
}
