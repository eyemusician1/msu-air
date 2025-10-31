import { getAllBookings, getFlights } from "@/lib/firestore"
import { NextResponse } from "next/server"
import type { Booking, Flight } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[Analytics] Fetching analytics data...")

    // Fetch all bookings and flights
    const [bookings, flights] = await Promise.all([
      getAllBookings(),
      getFlights()
    ])

    console.log("[Analytics] Fetched:", { 
      bookings: bookings.length, 
      flights: flights.length 
    })

    // Calculate total passengers
    const totalPassengers = bookings.reduce((sum, booking) => {
      return sum + (booking.passengers?.length || 0)
    }, 0)

    // Calculate total revenue (only confirmed/completed bookings)
    const totalRevenue = bookings
      .filter(b => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

    // Calculate total booked seats across all flights
    const totalBooked = flights.reduce((sum, flight) => sum + (flight.booked || 0), 0)

    // Generate monthly data for the last 6 months
    const monthlyData = generateMonthlyData(bookings)
    
    // Generate revenue distribution
    const revenueDistribution = generateRevenueDistribution(bookings)

    const analytics = {
      totalFlights: flights.length,
      totalPassengers,
      totalRevenue,
      totalBookings: bookings.length,
      monthlyData,
      revenueDistribution,
    }

    console.log("[Analytics] Calculated analytics:", analytics)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[Analytics] Error calculating analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate analytics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

function generateMonthlyData(bookings: Booking[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const monthlyStats: Record<string, { bookings: number; revenue: number }> = {}

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    monthlyStats[monthKey] = { bookings: 0, revenue: 0 }
  }

  // Aggregate bookings by month
  bookings.forEach((booking) => {
    const bookingDate = booking.createdAt instanceof Date 
      ? booking.createdAt 
      : new Date(booking.createdAt)
    
    const monthKey = `${monthNames[bookingDate.getMonth()]} ${bookingDate.getFullYear()}`
    
    if (monthlyStats[monthKey]) {
      monthlyStats[monthKey].bookings += 1
      if (booking.status === "confirmed" || booking.status === "completed") {
        monthlyStats[monthKey].revenue += booking.totalPrice || 0
      }
    }
  })

  // Convert to array format for charts
  return Object.entries(monthlyStats).map(([month, stats]) => ({
    month,
    bookings: stats.bookings,
    revenue: stats.revenue,
  }))
}

function generateRevenueDistribution(bookings: Booking[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const revenueByMonth: Record<string, number> = {}

  // Initialize last 4 months for pie chart
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${monthNames[date.getMonth()]}`
    revenueByMonth[monthKey] = 0
  }

  // Aggregate revenue by month (only confirmed/completed)
  bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .forEach((booking) => {
      const bookingDate = booking.createdAt instanceof Date 
        ? booking.createdAt 
        : new Date(booking.createdAt)
      
      const monthKey = `${monthNames[bookingDate.getMonth()]}`
      
      if (revenueByMonth[monthKey] !== undefined) {
        revenueByMonth[monthKey] += booking.totalPrice || 0
      }
    })

  // Convert to array format for pie chart
  return Object.entries(revenueByMonth)
    .map(([month, revenue]) => ({
      month,
      revenue,
    }))
    .filter(item => item.revenue > 0) // Only show months with revenue
}