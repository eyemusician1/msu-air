import { Navbar } from "@/components/navbar"
import { UserDashboard } from "@/components/user-dashboard"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/Protected-Route"

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <Navbar />
        <UserDashboard />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}
