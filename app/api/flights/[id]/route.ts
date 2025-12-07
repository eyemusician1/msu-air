export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = params.id
    await deleteFlight(flightId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting flight:", error)
    return NextResponse.json({ error: "Failed to delete flight" }, { status: 500 })
  }
}
import { getFlightById, updateFlight, deleteFlight } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flight = await getFlightById(params.id)
    
    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 })
    }

    return NextResponse.json(flight)
  } catch (error) {
    console.error("Error fetching flight:", error)
    return NextResponse.json({ error: "Failed to fetch flight" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = params.id
    const data = await request.json()
    const updated = await updateFlight(flightId, data)
    if (!updated) {
      return NextResponse.json({ error: "Flight not found or not updated" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating flight:", error)
    return NextResponse.json({ error: "Failed to update flight" }, { status: 500 })
  }
}