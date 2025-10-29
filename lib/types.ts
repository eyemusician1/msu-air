// Data types for the airline booking system

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  duration: string
  price: number
  seats: number
  stops: string
  from: string
  to: string
  date: string
  capacity: number
  booked: number
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  userId: string
  flightId: string
  passengers: Passenger[]
  selectedSeats: string[]
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  bookingRef: string
  createdAt: Date
  updatedAt: Date
}

export interface Passenger {
  name: string
  email: string
  phone: string
  seatAssignment?: string
}

export interface User {
  id: string
  email: string
  displayName: string
  phone?: string
  passport?: string
  createdAt: Date
  updatedAt: Date
}
