import { getReservedSeatsForFlight } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservedSeats = await getReservedSeatsForFlight(params.id)
    return NextResponse.json({ reservedSeats })
  } catch (error) {
    console.error("Error fetching reserved seats:", error)
    return NextResponse.json({ error: "Failed to fetch reserved seats" }, { status: 500 })
  }
}