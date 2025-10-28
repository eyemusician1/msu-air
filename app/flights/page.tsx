import { Navbar } from "@/components/navbar"
import { FlightResults } from "@/components/flight-results"
import { Footer } from "@/components/footer"

export default function FlightsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <FlightResults />
      <Footer />
    </main>
  )
}
