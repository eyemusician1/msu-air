import { createBooking, getBookings, getFlightById, updateFlight, getReservedSeatsForFlight } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const bookings = await getBookings(userId)
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId || !body.flightId || !body.selectedSeats || !body.passengers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const flight = await getFlightById(body.flightId)
    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 })
    }

    const reservedSeats = await getReservedSeatsForFlight(body.flightId)
    const requestedSeats = body.selectedSeats as string[]
    const conflictingSeats = requestedSeats.filter(seat => reservedSeats.includes(seat))
    
    if (conflictingSeats.length > 0) {
      return NextResponse.json({ 
        error: "Some seats are no longer available", 
        conflictingSeats 
      }, { status: 409 })
    }

    const newBookedCount = flight.booked + requestedSeats.length
    if (newBookedCount > flight.capacity) {
      return NextResponse.json({ error: "Not enough seats available" }, { status: 400 })
    }

    const bookingId = await createBooking({
      userId: body.userId,
      flightId: body.flightId,
      passengers: body.passengers,
      selectedSeats: body.selectedSeats,
      totalPrice: body.totalPrice,
      status: "confirmed",
      bookingRef: body.bookingRef,
    })

    await updateFlight(body.flightId, {
      booked: newBookedCount,
      seats: flight.capacity - newBookedCount
    })

    return NextResponse.json({ 
      success: true, 
      bookingId,
      message: "Booking created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}