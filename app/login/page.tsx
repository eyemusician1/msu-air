import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import { Footer } from "@/components/footer"

export default function Login() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <LoginForm />
      <Footer />
    </main>
  )
}
