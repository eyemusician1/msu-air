// API route to manage flights
import { getFlights, searchFlights, addFlight, updateFlight, deleteFlight } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")

    let flights
    if (from && to && date) {
      flights = await searchFlights(from, to, date)
    } else {
      flights = await getFlights()
    }

    return NextResponse.json(flights)
  } catch (error) {
    console.error("Error in flights API:", error)
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.flightNumber || !body.from || !body.to || !body.capacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const flightData = {
      airline: body.airline || "Admin Added",
      flightNumber: body.flightNumber,
      from: body.from,
      to: body.to,
      capacity: Number(body.capacity),
      seats: Number(body.capacity),
      booked: body.booked || 0,
      departure: body.departure || "00:00",
      arrival: body.arrival || "00:00",
      duration: body.duration || "0h 0m",
      price: body.price || 299,
      stops: body.stops || "Non-stop",
      date: body.date || new Date().toISOString().split('T')[0],
    }

    const flightId = await addFlight(flightData)
    return NextResponse.json({ id: flightId, ...flightData }, { status: 201 })
  } catch (error) {
    console.error("Error creating flight:", error)
    return NextResponse.json({ error: "Failed to create flight" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Flight ID is required" }, { status: 400 })
    }

    const body = await request.json()
    
    const updates = {
      ...(body.flightNumber && { flightNumber: body.flightNumber }),
      ...(body.from && { from: body.from }),
      ...(body.to && { to: body.to }),
      ...(body.capacity && { capacity: Number(body.capacity), seats: Number(body.capacity) }),
      ...(body.airline && { airline: body.airline }),
      ...(body.departure && { departure: body.departure }),
      ...(body.arrival && { arrival: body.arrival }),
      ...(body.duration && { duration: body.duration }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.stops && { stops: body.stops }),
      ...(body.date && { date: body.date }),
      ...(body.booked !== undefined && { booked: body.booked }),
    }

    await updateFlight(id, updates)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error updating flight:", error)
    return NextResponse.json({ error: "Failed to update flight" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Flight ID is required" }, { status: 400 })
    }

    await deleteFlight(id)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error deleting flight:", error)
    return NextResponse.json({ error: "Failed to delete flight" }, { status: 500 })
  }
}