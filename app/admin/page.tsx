import { Navbar } from "@/components/navbar"
import { AdminPanel } from "@/components/admin-panel"
import { Footer } from "@/components/footer"

export default function Admin() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AdminPanel />
      <Footer />
    </main>
  )
}
