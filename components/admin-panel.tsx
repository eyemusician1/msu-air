"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Plus, Edit2, Trash2, Users, Plane, DollarSign, TrendingUp, X, Search } from "lucide-react"
import type { Flight, Booking } from "@/lib/types"

const COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#06b6d4"]

interface EnrichedBooking extends Booking {
  flight?: {
    flightNumber: string
    from: string
    to: string
    date: string
    departure: string
    arrival: string
  }
}

interface AnalyticsData {
  totalBookings: number
  totalPassengers: number
  totalRevenue: number
  totalFlights: number
  monthlyData: Array<{ month: string; bookings: number; revenue: number }>
  revenueDistribution: Array<{ month: string; revenue: number }>
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddFlight, setShowAddFlight] = useState(false)
  const [flightData, setFlightData] = useState<Flight[]>([])
  const [bookingsData, setBookingsData] = useState<EnrichedBooking[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    number: "",
    from: "",
    to: "",
    capacity: "",
    departure: "",
    arrival: "",
    duration: "",
    price: "",
    date: "",
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const flightsResponse = await fetch("/api/flights")
      if (flightsResponse.ok) {
        const flights = await flightsResponse.json()
        if (Array.isArray(flights)) {
          setFlightData(flights)
        }
      }

      const bookingsResponse = await fetch("/api/admin/bookings")
      if (bookingsResponse.ok) {
        const bookings = await bookingsResponse.json()
        if (Array.isArray(bookings)) {
          setBookingsData(bookings)
        }
      }

      const analyticsResponse = await fetch("/api/admin/analytics")
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json()
        setAnalyticsData(analytics)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFlight = async () => {
    if (formData.number && formData.from && formData.to && formData.capacity) {
      try {
        const flightPayload = {
          flightNumber: formData.number,
          from: formData.from,
          to: formData.to,
          capacity: Number(formData.capacity),
          airline: "Flight",
          departure: formData.departure || "00:00",
          arrival: formData.arrival || "00:00",
          duration: formData.duration || "0h 0m",
          price: Number(formData.price) || 299,
          seats: Number(formData.capacity),
          stops: "Non-stop",
          date: formData.date || new Date().toISOString().split("T")[0],
          booked: 0,
        }

        let response
        if (editingFlight) {
          response = await fetch(`/api/flights?id=${editingFlight.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(flightPayload),
          })
        } else {
          response = await fetch("/api/flights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(flightPayload),
          })
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to save flight")
        }

        await fetchData()
        setFormData({
          number: "",
          from: "",
          to: "",
          capacity: "",
          departure: "",
          arrival: "",
          duration: "",
          price: "",
          date: "",
        })
        setShowAddFlight(false)
        setEditingFlight(null)
      } catch (error) {
        console.error("Error saving flight:", error)
        alert(`Failed to save flight: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } else {
      alert("Please fill in all required fields (Flight Number, From, To, Capacity)")
    }
  }

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight)
    setFormData({
      number: flight.flightNumber,
      from: flight.from,
      to: flight.to,
      capacity: flight.capacity.toString(),
      departure: flight.departure || "",
      arrival: flight.arrival || "",
      duration: flight.duration || "",
      price: flight.price?.toString() || "",
      date: flight.date || "",
    })
    setShowAddFlight(true)
  }

  const handleDeleteFlight = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flight?")) return

    try {
      const response = await fetch(`/api/flights?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete flight")
      await fetchData()
    } catch (error) {
      console.error("Error deleting flight:", error)
      alert("Failed to delete flight. Please try again.")
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update booking")
      await fetchData()
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Failed to update booking. Please try again.")
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete booking")
      await fetchData()
    } catch (error) {
      console.error("Error deleting booking:", error)
      alert("Failed to delete booking. Please try again.")
    }
  }

  const handleCancel = () => {
    setShowAddFlight(false)
    setEditingFlight(null)
    setFormData({
      number: "",
      from: "",
      to: "",
      capacity: "",
      departure: "",
      arrival: "",
      duration: "",
      price: "",
      date: "",
    })
  }

  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight?.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengers.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const displayAnalyticsData = analyticsData?.monthlyData || []
  const displayRevenueDistribution = analyticsData?.revenueDistribution || []

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">Loading admin panel...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">Manage flights, bookings, and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Flights</p>
                <p className="text-3xl font-bold text-white">{analyticsData?.totalFlights || 0}</p>
              </div>
              <Plane size={32} className="text-emerald-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-teal-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Passengers</p>
                <p className="text-3xl font-bold text-white">{analyticsData?.totalPassengers || 0}</p>
              </div>
              <Users size={32} className="text-teal-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">₱{(analyticsData?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign size={32} className="text-amber-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{analyticsData?.totalBookings || 0}</p>
              </div>
              <TrendingUp size={32} className="text-cyan-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700">
            <div className="flex">
              {["overview", "flights", "passengers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === tab
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Bookings & Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={displayAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis yAxisId="left" stroke="#94a3b8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Bookings</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={displayAnalyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                        <Bar dataKey="bookings" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={displayRevenueDistribution}
                          dataKey="revenue"
                          nameKey="month"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {displayRevenueDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flights" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Manage Flights</h3>
                  {!showAddFlight && (
                    <button
                      onClick={() => setShowAddFlight(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition"
                    >
                      <Plus size={18} /> Add Flight
                    </button>
                  )}
                </div>

                {showAddFlight && (
                  <div className="bg-slate-700 p-6 rounded-lg mb-6 border border-slate-600">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white">{editingFlight ? "Edit Flight" : "Add New Flight"}</h4>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-200">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Flight Number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="From"
                        value={formData.from}
                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="To"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="number"
                        placeholder="Capacity"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="time"
                        placeholder="Departure"
                        value={formData.departure}
                        onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="time"
                        placeholder="Arrival"
                        value={formData.arrival}
                        onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., 2h 30m)"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <input
                        type="date"
                        placeholder="Date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                      <div className="flex gap-2 md:col-span-3">
                        <button
                          onClick={handleAddFlight}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
                        >
                          {editingFlight ? "Update" : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 px-4 py-2 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Flight</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Route</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Capacity</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Booked</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Occupancy</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightData.map((flight) => (
                        <tr key={flight.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 font-semibold text-white">{flight.flightNumber}</td>
                          <td className="py-3 px-4 text-slate-300">
                            {flight.from} → {flight.to}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{flight.date}</td>
                          <td className="py-3 px-4 text-slate-300">{flight.capacity}</td>
                          <td className="py-3 px-4 text-slate-300">{flight.booked || 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{ width: `${((flight.booked || 0) / flight.capacity) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-200">
                                {Math.round(((flight.booked || 0) / flight.capacity) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => handleEditFlight(flight)}
                              className="p-2 text-emerald-400 hover:bg-slate-700 rounded transition"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteFlight(flight.id)}
                              className="p-2 text-red-400 hover:bg-slate-700 rounded transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "passengers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Passenger Bookings</h3>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center text-slate-400 py-12">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-white text-lg">Booking #{booking.bookingRef}</h4>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  booking.status === "confirmed"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : booking.status === "pending"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : booking.status === "cancelled"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-teal-500/20 text-teal-300"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            {booking.flight && (
                              <div className="text-slate-300 mb-2">
                                <span className="font-semibold text-emerald-400">{booking.flight.flightNumber}</span>
                                {" • "}
                                {booking.flight.from} → {booking.flight.to}
                                {" • "}
                                {booking.flight.date} at {booking.flight.departure}
                              </div>
                            )}
                            <div className="text-sm text-slate-400">
                              Booked: {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white mb-2">
                              ₱{booking.totalPrice.toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                className="px-3 py-1 bg-slate-600 border border-slate-500 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-2 text-red-400 hover:bg-slate-600 rounded transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-600 pt-4">
                          <h5 className="font-semibold text-white mb-3">Passengers ({booking.passengers.length})</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {booking.passengers.map((passenger, idx) => (
                              <div key={idx} className="bg-slate-600 rounded p-3">
                                <div className="font-semibold text-white">{passenger.name}</div>
                                <div className="text-sm text-slate-300">{passenger.email}</div>
                                <div className="text-sm text-slate-400">{passenger.phone}</div>
                                {passenger.seatAssignment && (
                                  <div className="text-sm text-emerald-400 font-semibold mt-1">
                                    Seat: {passenger.seatAssignment}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                            <div className="mt-3 text-sm text-slate-400">
                              Selected Seats: {booking.selectedSeats.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
