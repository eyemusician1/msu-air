import { getAllBookings, getFlightById } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET - Fetch all bookings with flight data (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const bookings = await getAllBookings()
    
    // Enrich bookings with flight data
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        if (booking.flightId) {
          const flight = await getFlightById(booking.flightId)
          if (flight) {
            return {
              ...booking,
              flight: {
                flightNumber: flight.flightNumber,
                from: flight.from,
                to: flight.to,
                date: flight.date,
                departure: flight.departure,
                arrival: flight.arrival
              }
            }
          }
        }
        return booking
      })
    )
    
    return NextResponse.json(enrichedBookings)
  } catch (error) {
    console.error("[Admin Bookings] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}