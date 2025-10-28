import { Navbar } from "@/components/navbar"
import { BookingPage } from "@/components/booking-page"
import { Footer } from "@/components/footer"

export default function Booking() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BookingPage />
      <Footer />
    </main>
  )
}
