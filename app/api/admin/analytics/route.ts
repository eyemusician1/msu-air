import { getAllBookings, getBookingById, updateBooking, deleteBooking, getFlightById } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Admin bookings API called")
    console.log("[v0] Firebase config check:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓" : "✗",
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓" : "✗",
    })

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (id) {
      const booking = await getBookingById(id)
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      return NextResponse.json(booking)
    }

    const bookings = await getAllBookings()
    console.log("[v0] Fetched bookings:", bookings.length)

    // Enrich bookings with flight information
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const flight = await getFlightById(booking.flightId)
          return {
            ...booking,
            flight: flight
              ? {
                  flightNumber: flight.flightNumber,
                  from: flight.from,
                  to: flight.to,
                  date: flight.date,
                  departure: flight.departure,
                  arrival: flight.arrival,
                }
              : null,
          }
        } catch (err) {
          console.error("[v0] Error enriching booking:", err)
          return booking
        }
      }),
    )

    console.log("[v0] Enriched bookings:", enrichedBookings.length)
    return NextResponse.json(enrichedBookings)
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const body = await request.json()

    const updates = {
      ...(body.status && { status: body.status }),
      ...(body.passengers && { passengers: body.passengers }),
      ...(body.totalPrice !== undefined && { totalPrice: body.totalPrice }),
    }

    await updateBooking(id, updates)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    await deleteBooking(id)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
