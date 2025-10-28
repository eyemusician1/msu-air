"use client"

import { useState } from "react"
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
import { Plus, Edit2, Trash2, Users, Plane, DollarSign, TrendingUp, X } from "lucide-react"

const analyticsData = [
  { month: "Jan", bookings: 400, revenue: 24000 },
  { month: "Feb", bookings: 520, revenue: 31200 },
  { month: "Mar", bookings: 480, revenue: 28800 },
  { month: "Apr", bookings: 610, revenue: 36600 },
  { month: "May", bookings: 700, revenue: 42000 },
  { month: "Jun", bookings: 850, revenue: 51000 },
]

const initialFlightData = [
  { id: 1, number: "SW101", from: "JFK", to: "LAX", capacity: 180, booked: 156 },
  { id: 2, number: "SW202", from: "LAX", to: "ORD", capacity: 180, booked: 142 },
  { id: 3, number: "AF305", from: "ORD", to: "MIA", capacity: 150, booked: 128 },
]

const COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#06b6d4"]

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddFlight, setShowAddFlight] = useState(false)
  const [flightData, setFlightData] = useState(initialFlightData)
  const [editingFlight, setEditingFlight] = useState<(typeof initialFlightData)[0] | null>(null)
  const [formData, setFormData] = useState({
    number: "",
    from: "",
    to: "",
    capacity: "",
  })

  const handleAddFlight = () => {
    if (formData.number && formData.from && formData.to && formData.capacity) {
      if (editingFlight) {
        setFlightData(
          flightData.map((f) =>
            f.id === editingFlight.id
              ? {
                  ...f,
                  number: formData.number,
                  from: formData.from,
                  to: formData.to,
                  capacity: Number(formData.capacity),
                }
              : f,
          ),
        )
        setEditingFlight(null)
      } else {
        setFlightData([
          ...flightData,
          {
            id: Math.max(...flightData.map((f) => f.id), 0) + 1,
            number: formData.number,
            from: formData.from,
            to: formData.to,
            capacity: Number(formData.capacity),
            booked: 0,
          },
        ])
      }
      setFormData({ number: "", from: "", to: "", capacity: "" })
      setShowAddFlight(false)
    }
  }

  const handleEditFlight = (flight: (typeof initialFlightData)[0]) => {
    setEditingFlight(flight)
    setFormData({
      number: flight.number,
      from: flight.from,
      to: flight.to,
      capacity: flight.capacity.toString(),
    })
    setShowAddFlight(true)
  }

  const handleDeleteFlight = (id: number) => {
    setFlightData(flightData.filter((f) => f.id !== id))
  }

  const handleCancel = () => {
    setShowAddFlight(false)
    setEditingFlight(null)
    setFormData({ number: "", from: "", to: "", capacity: "" })
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
                <p className="text-3xl font-bold text-white">{flightData.length}</p>
              </div>
              <Plane size={32} className="text-emerald-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-teal-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{flightData.reduce((sum, f) => sum + f.booked, 0)}</p>
              </div>
              <Users size={32} className="text-teal-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ${(flightData.reduce((sum, f) => sum + f.booked, 0) * 299).toLocaleString()}
                </p>
              </div>
              <DollarSign size={32} className="text-amber-400 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-white">
                  {flightData.length > 0
                    ? Math.round(
                        (flightData.reduce((sum, f) => sum + f.booked, 0) /
                          flightData.reduce((sum, f) => sum + f.capacity, 0)) *
                          100,
                      )
                    : 0}
                  %
                </p>
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
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
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
                      <BarChart data={analyticsData}>
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
                          data={analyticsData.slice(0, 4)}
                          dataKey="revenue"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {analyticsData.slice(0, 4).map((_, index) => (
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
                      <div className="flex gap-2 md:col-span-2">
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Capacity</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Booked</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Occupancy</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightData.map((flight) => (
                        <tr key={flight.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 font-semibold text-white">{flight.number}</td>
                          <td className="py-3 px-4 text-slate-300">
                            {flight.from} → {flight.to}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{flight.capacity}</td>
                          <td className="py-3 px-4 text-slate-300">{flight.booked}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{ width: `${(flight.booked / flight.capacity) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-200">
                                {Math.round((flight.booked / flight.capacity) * 100)}%
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
                <h3 className="text-lg font-semibold text-white mb-6">Passenger List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Flight</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Seat</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-200">Booking Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "John Doe", flight: "SW101", seat: "12A", status: "Confirmed", date: "2024-12-01" },
                        { name: "Jane Smith", flight: "SW101", seat: "12B", status: "Confirmed", date: "2024-12-01" },
                        { name: "Bob Johnson", flight: "SW202", seat: "5C", status: "Checked In", date: "2024-12-02" },
                        { name: "Alice Brown", flight: "AF305", seat: "8A", status: "Confirmed", date: "2024-12-03" },
                      ].map((passenger, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 font-semibold text-white">{passenger.name}</td>
                          <td className="py-3 px-4 text-slate-300">{passenger.flight}</td>
                          <td className="py-3 px-4 text-slate-300">{passenger.seat}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                passenger.status === "Confirmed"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-teal-500/20 text-teal-300"
                              }`}
                            >
                              {passenger.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{passenger.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
