"use client"

import { Plane } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Plane Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" />
          
          {/* Middle ring */}
          <div className="absolute inset-2 border-4 border-emerald-500/30 rounded-full" />
          
          {/* Spinning border */}
          <div className="absolute inset-4 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          
          {/* Plane icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Plane className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Loading</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-slate-400 text-sm">Please wait...</p>
        </div>
      </div>
    </div>
  )
}
