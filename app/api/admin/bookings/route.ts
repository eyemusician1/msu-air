import { getAllBookings, getFlightById } from "@/lib/firestore"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[Admin Bookings] Fetching all bookings...")
    
    const bookings = await getAllBookings()
    console.log(`[Admin Bookings] Found ${bookings.length} bookings`)

    // If no bookings, return empty array
    if (!bookings || bookings.length === 0) {
      console.log("[Admin Bookings] No bookings found, returning empty array")
      return NextResponse.json([])
    }

    // Enrich bookings with flight information
    console.log("[Admin Bookings] Enriching bookings with flight data...")
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (!booking.flightId) {
            console.warn("[Admin Bookings] Booking has no flightId:", booking.id)
            return booking
          }

          const flight = await getFlightById(booking.flightId)
          return {
            ...booking,
            flight: flight
              ? {
                  flightNumber: flight.flightNumber,
                  airline: flight.airline,
                  from: flight.from,
                  to: flight.to,
                  date: flight.date,
                  departure: flight.departure,
                  arrival: flight.arrival,
                }
              : null,
          }
        } catch (err) {
          console.error("[Admin Bookings] Error enriching booking:", booking.id, err)
          return booking
        }
      })
    )

    console.log(`[Admin Bookings] Successfully enriched ${enrichedBookings.length} bookings`)
    return NextResponse.json(enrichedBookings)
  } catch (error) {
    console.error("[Admin Bookings] Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch bookings", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}
