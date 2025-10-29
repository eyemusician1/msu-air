import { getFlightById } from "@/lib/firestore"
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