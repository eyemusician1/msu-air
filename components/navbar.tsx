"use client"

import Link from "next/link"
import { Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const [imageError, setImageError] = useState(false)

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || "U"
  }

  const handleLogout = async () => {
    await logout()
  }

  const UserAvatar = ({ size = "default" }: { size?: "default" | "large" }) => {
    const sizeClasses = size === "large" ? "w-10 h-10" : "w-10 h-10"
    const textSize = size === "large" ? "text-sm" : "text-sm"

    // If user has a photoURL and no error occurred, show the image
    if (user?.photoURL && !imageError) {
      return (
        <div className={`${sizeClasses} rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center`}>
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )
    }

    // Fallback to initials
    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center`}>
        <span className={`text-slate-900 font-bold ${textSize}`}>{getUserInitials()}</span>
      </div>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/plane.png" 
              alt="Skyrithm Logo" 
              className="w-8 h-8"
            />
            <span className="font-bold text-xl text-white">Skyrithm</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-emerald-400 transition font-medium">
              Home
            </Link>
            <Link href="/flights" className="text-slate-300 hover:text-emerald-400 transition font-medium">
              Flights
            </Link>
            <Link href="/bookings" className="text-slate-300 hover:text-emerald-400 transition font-medium">
              My Bookings
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="hover:shadow-lg hover:shadow-emerald-500/30 transition rounded-full"
                >
                  <UserAvatar />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-700 transition font-semibold flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition font-semibold"
              >
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-emerald-500/20">
            <Link
              href="/"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded transition"
            >
              Home
            </Link>
            <Link
              href="/flights"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded transition"
            >
              Flights
            </Link>
            <Link
              href="/bookings"
              className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded transition"
            >
              My Bookings
            </Link>

            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="px-4 py-2 flex items-center gap-3 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded transition"
                >
                  <UserAvatar size="large" />
                  <span>Profile</span>
                </Link>
                <div className="px-4 py-2 text-slate-400 text-sm">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-slate-800 text-slate-300 hover:text-emerald-400 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 rounded font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}