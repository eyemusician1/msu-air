"use client"

import { useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

export function SearchSummary() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const departDate = searchParams.get("departDate")
  const returnDate = searchParams.get("returnDate")
  const tripType = searchParams.get("tripType")
  const passengers = searchParams.get("passengers")
  const cabinClass = searchParams.get("cabinClass")
  const directFlightsOnly = searchParams.get("directFlightsOnly") === "true"

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleNewSearch = () => {
    router.push("/")
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-400">Searching:</span>
          <span className="font-semibold text-emerald-400">{from}</span>
          <span className="text-slate-500">→</span>
          <span className="font-semibold text-emerald-400">{to}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{formatDate(departDate)}</span>
          {tripType === "roundtrip" && returnDate && (
            <>
              <span className="text-slate-500">→</span>
              <span className="text-slate-300">{formatDate(returnDate)}</span>
            </>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            {passengers} {Number(passengers) === 1 ? "passenger" : "passengers"}
          </span>
          {cabinClass && cabinClass !== "economy" && (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 capitalize">{cabinClass}</span>
            </>
          )}
          {directFlightsOnly && (
            <>
              <span className="text-slate-500">•</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                Direct Only
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleNewSearch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition font-medium text-sm whitespace-nowrap"
        >
          <X size={16} /> New Search
        </button>
      </div>
    </div>
  )
}
