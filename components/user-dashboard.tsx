// components/user-dashboard.tsx - FIXED VERSION
"use client"

import { useState, useEffect } from "react"
import { LogOut, User, Bookmark, Plane, Calendar, QrCode, Heart, Edit2, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Booking } from "@/lib/types"

export function UserDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"bookings" | "profile" | "saved">("bookings")
  const [bookingTab, setBookingTab] = useState("upcoming")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: user?.displayName || "User",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    passport: "AB123456",
  })

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.displayName || "User",
        email: user.email || "",
        phone: "+1 (555) 123-4567",
        passport: "AB123456",
      })
    }
  }, [user])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/bookings?userId=${user.uid}`)
        if (response.ok) {
          const data = await response.json()
          setBookings(data)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  const filteredBookings = bookings.filter((b) => {
    if (bookingTab === "upcoming") return b.status === "confirmed"
    if (bookingTab === "completed") return b.status === "completed"
    if (bookingTab === "cancelled") return b.status === "cancelled"
    return false
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your bookings...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-20">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                  <p className="text-sm text-gray-600 truncate">{profile.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    activeTab === "bookings"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <Bookmark size={18} /> My Bookings
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    activeTab === "saved" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <Heart size={18} /> Saved Flights
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <User size={18} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {["upcoming", "completed", "cancelled"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setBookingTab(tab)}
                        className={`flex-1 px-6 py-4 font-semibold transition ${
                          bookingTab === tab
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Plane size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">No {bookingTab} bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">Flight {booking.flightId}</span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    booking.status === "confirmed"
                                      ? "bg-green-100 text-green-800"
                                      : booking.status === "completed"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Seats: {booking.selectedSeats.join(", ")}
                              </p>
                              <p className="text-sm text-gray-500">
                                Passengers: {booking.passengers.map(p => p.name).join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Booking Ref</p>
                              <p className="font-semibold text-gray-900">{booking.bookingRef}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Flights Tab */}
            {activeTab === "saved" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No saved flights yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      {isEditingProfile ? (
                        <>
                          <Save size={18} /> Save
                        </>
                      ) : (
                        <>
                          <Edit2 size={18} /> Edit
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange("name", e.target.value)}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Passport Number</label>
                      <input
                        type="text"
                        value={profile.passport}
                        onChange={(e) => handleProfileChange("passport", e.target.value)}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Plane size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Flight</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.flightId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <QrCode size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.bookingRef}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Plane size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Seats</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.selectedSeats.join(", ")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-semibold text-gray-900">
                    {selectedBooking.passengers.map(p => p.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}