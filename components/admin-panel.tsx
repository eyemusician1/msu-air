"use client"

import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  Plane, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  PhilippinePeso,
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  MapPin,
  Clock,
  Package,
  Check,
  XCircle,
  MoreVertical
} from "lucide-react"
import { FlightDialog } from "./flight-dialog"
import type { Flight } from "@/lib/types"

// Using shared `Flight` type from `lib/types` (imported above)

interface Booking {
  id: string
  bookingRef: string
  userId: string
  flightId: string
  passengers: any[]
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: any
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
  totalFlights: number
  totalBookings: number
  totalPassengers: number
  totalRevenue: number
  monthlyData?: any[]
  revenueDistribution?: any[]
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "flights" | "bookings">("dashboard")
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all")
  const [showFlightDialog, setShowFlightDialog] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === "flights" || activeTab === "dashboard") {
        const flightsRes = await fetch("/api/flights")
        const flightsData = await flightsRes.json()
        setFlights(Array.isArray(flightsData) ? flightsData : [])
      }

      if (activeTab === "bookings" || activeTab === "dashboard") {
        const bookingsRes = await fetch("/api/admin/bookings")
        
        if (!bookingsRes.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsRes.status}`)
        }
        
        const bookingsData = await bookingsRes.json()
        
        if (bookingsData.error) {
          setBookings([])
        } else {
          setBookings(Array.isArray(bookingsData) ? bookingsData : [])
        }
      }

      if (activeTab === "dashboard") {
        const analyticsRes = await fetch("/api/admin/analytics")
        
        if (!analyticsRes.ok) {
          throw new Error(`Failed to fetch analytics: ${analyticsRes.status}`)
        }
        
        const analyticsData = await analyticsRes.json()
        setAnalyticsData(analyticsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Flight CRUD Operations
  const handleAddFlight = () => {
    setSelectedFlight(null)
    setDialogMode("add")
    setShowFlightDialog(true)
  }

  const handleEditFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setDialogMode("edit")
    setShowFlightDialog(true)
  }

  const handleSubmitFlight = async (flightData: Partial<Flight>) => {
    try {
      if (dialogMode === "add") {
        // Create new flight
        const res = await fetch("/api/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...flightData,
            booked: 0 // New flights start with 0 bookings
          })
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create flight")
        }

        const newFlight = await res.json()
        setFlights([...flights, newFlight])
        alert("✈️ Flight created successfully!")
      } else {
        // Update existing flight
        const res = await fetch(`/api/flights/${selectedFlight?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flightData)
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update flight")
        }

        const updatedFlight = await res.json()
        setFlights(flights.map(f => f.id === updatedFlight.id ? updatedFlight : f))
        alert("✅ Flight updated successfully!")
      }

      setShowFlightDialog(false)
      setSelectedFlight(null)
      fetchData() // Refresh data
    } catch (error: any) {
      console.error("Error submitting flight:", error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleDeleteFlight = async (id: string) => {
    const flight = flights.find(f => f.id === id)
    
    if (!confirm(`Are you sure you want to delete flight ${flight?.flightNumber}?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/flights/${id}`, { method: "DELETE" })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete flight")
      }

      setFlights(flights.filter(f => f.id !== id))
      alert("🗑️ Flight deleted successfully")
      fetchData() // Refresh to update analytics
    } catch (error: any) {
      console.error("Error deleting flight:", error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Booking CRUD Operations
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update booking")
      }

      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
      
      const statusEmoji = {
        confirmed: "✅",
        pending: "⏳",
        cancelled: "❌"
      }
      
      alert(`${statusEmoji[newStatus]} Booking status updated to ${newStatus}`)
      fetchData() // Refresh analytics
    } catch (error: any) {
      console.error("Error updating booking:", error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    
    if (!confirm(`Are you sure you want to delete booking ${booking?.bookingRef}?\n\nThis will permanently remove the booking and cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, { method: "DELETE" })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete booking")
      }

      setBookings(bookings.filter(b => b.id !== bookingId))
      alert("🗑️ Booking deleted successfully")
      fetchData() // Refresh data to update analytics
    } catch (error: any) {
      console.error("Error deleting booking:", error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden group hover:border-slate-600 transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('/10', '/20')}`}>
            <Icon className={`w-6 h-6 ${color.replace('from-', 'text-').replace('/10', '').split(' ')[0]}`} />
          </div>
          {change && (
            <span className={`text-sm font-semibold ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  )

  // Get recent bookings
  const recentBookings = [...(bookings || [])]
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0
      return dateB - dateA
    })
    .slice(0, 5)

  // Filter bookings by status
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Count by status
  const pendingCount = bookings.filter(b => b.status === "pending").length
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage flights, bookings, and view analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("flights")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "flights"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Plane className="w-5 h-5" />
            Flights
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative ${
              activeTab === "bookings"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Package className="w-5 h-5" />
            Bookings
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Plane}
                label="Total Flights"
                value={analyticsData?.totalFlights || 0}
                change={12}
                color="from-blue-500/10 to-cyan-500/10"
              />
              <StatCard
                icon={Users}
                label="Total Passengers"
                value={analyticsData?.totalPassengers || 0}
                change={8}
                color="from-purple-500/10 to-pink-500/10"
              />
              <StatCard
                icon={PhilippinePeso}
                label="Total Revenue"
                value={`₱${(analyticsData?.totalRevenue || 0).toLocaleString()}`}
                change={15}
                color="from-emerald-500/10 to-teal-500/10"
              />
              <StatCard
                icon={BarChart3}
                label="Pending Requests"
                value={pendingCount}
                color="from-orange-500/10 to-red-500/10"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-400" />
                  Recent Bookings
                </h2>
              </div>

              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div
                      key={booking.id || index}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          booking.status === "confirmed" 
                            ? "bg-emerald-500/20" 
                            : booking.status === "pending"
                            ? "bg-orange-500/20"
                            : "bg-red-500/20"
                        }`}>
                          {booking.status === "confirmed" ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : booking.status === "pending" ? (
                            <Clock className="w-5 h-5 text-orange-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{booking.bookingRef}</p>
                          <p className="text-sm text-slate-400">
                            {booking.passengers?.length || 0} passengers
                            {booking.flight && ` • ${booking.flight.from} → ${booking.flight.to}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">₱{booking.totalPrice.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : booking.status === "pending"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No recent bookings</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flights View */}
        {activeTab === "flights" && (
          <div className="space-y-6">
            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search flights by number, route..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <button
                onClick={handleAddFlight}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Flight
              </button>
            </div>

            {/* Flights Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Booked</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {(flights || [])
                      .filter(f => 
                        f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.to.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((flight) => {
                        const occupancy = flight.capacity ? ((flight.booked || 0) / flight.capacity) * 100 : 0
                        return (
                          <tr key={flight.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <Plane className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{flight.flightNumber}</p>
                                  <p className="text-sm text-slate-400">{flight.airline}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{flight.from}</span>
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-white">{flight.to}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {flight.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white font-semibold">{flight.capacity}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold">
                                {flight.booked || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      occupancy >= 80 ? 'bg-red-500' : occupancy >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${occupancy}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-slate-300 min-w-[3rem]">
                                  {occupancy.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditFlight(flight)}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFlight(flight.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings View */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bookings by reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statusFilter === "all"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-900/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({bookings.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statusFilter === "pending"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-slate-900/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter("confirmed")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statusFilter === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-900/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter("cancelled")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statusFilter === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-900/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    Cancelled ({cancelledCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{booking.bookingRef}</h3>
                      <p className="text-sm text-slate-400">
                        {booking.createdAt?.seconds 
                          ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : booking.status === "pending"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">{booking.passengers.length} passengers</span>
                    </div>
                    {booking.flight && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Plane className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">
                          {booking.flight.flightNumber} • {booking.flight.from} → {booking.flight.to}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Price</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        ₱{booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                        className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, "pending")}
                        className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <Clock className="w-4 h-4" />
                        Set Pending
                      </button>
                    )}
                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-16 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
                <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-xl text-slate-400">No bookings found</p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Loading data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Flight Dialog */}
      <FlightDialog
        isOpen={showFlightDialog}
        onClose={() => {
          setShowFlightDialog(false)
          setSelectedFlight(null)
        }}
        onSubmit={handleSubmitFlight}
        flight={selectedFlight}
        mode={dialogMode}
      />
    </div>
  )
}