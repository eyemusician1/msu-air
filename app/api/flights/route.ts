// API route to fetch flights
import { getFlights, searchFlights } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

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
