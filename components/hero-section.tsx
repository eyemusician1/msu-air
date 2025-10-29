"use client"

import { Plane } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-8 h-8 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
              Premium Travel Experience
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance">Discover Your Next Adventure</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto text-balance">
            Book flights to over 500 destinations worldwide with our modern, secure, and user-friendly airline
            reservation system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-slate-800/50 backdrop-blur border border-emerald-500/20 rounded-xl p-8 hover:border-emerald-500/50 transition group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition"></div>
            <h3 className="font-semibold text-white mb-2 text-lg">Global Routes</h3>
            <p className="text-slate-400">Access flights to over 500 destinations worldwide with competitive pricing</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-emerald-500/20 rounded-xl p-8 hover:border-emerald-500/50 transition group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition"></div>
            <h3 className="font-semibold text-white mb-2 text-lg">Best Prices</h3>
            <p className="text-slate-400">Guaranteed lowest fares with our price match guarantee and exclusive deals</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-emerald-500/20 rounded-xl p-8 hover:border-emerald-500/50 transition group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition"></div>
            <h3 className="font-semibold text-white mb-2 text-lg">Instant Booking</h3>
            <p className="text-slate-400">Book and confirm your flight in seconds with our streamlined checkout</p>
          </div>
        </div>
      </div>
    </section>
  )
}
