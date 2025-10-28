import { Navbar } from "@/components/navbar"
import { UserDashboard } from "@/components/user-dashboard"
import { Footer } from "@/components/footer"

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <UserDashboard />
      <Footer />
    </main>
  )
}
