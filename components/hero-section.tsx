"use client"

export function HeroSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      <div className="absolute top-32 right-12 w-72 h-72 bg-emerald-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-12 w-72 h-72 bg-teal-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-6">Skyrithm Services</p>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 text-balance leading-tight">
            Find Your Flight
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto text-balance leading-relaxed">
            Experience seamless flight booking to over 50 destinations across the Philippines and Overseas. Fast, reliable, and built
            for modern travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-lg p-8 hover:border-emerald-500/30 transition duration-300">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-emerald-400">50+</span>
                <span className="text-sm text-slate-400">Destinations</span>
              </div>
              <h3 className="font-semibold text-white mb-3 text-lg">Extensive Coverage</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fly to over 50 destinations throughout the Philippines and Overseas! With competitive rates and flexible scheduling.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-lg p-8 hover:border-emerald-500/30 transition duration-300">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-emerald-400">24/7</span>
                <span className="text-sm text-slate-400">Support</span>
              </div>
              <h3 className="font-semibold text-white mb-3 text-lg">Always Available</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Book anytime with our always-on platform. Instant confirmation and real-time updates for your peace of
                mind.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-lg p-8 hover:border-emerald-500/30 transition duration-300">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-emerald-400">Best</span>
                <span className="text-sm text-slate-400">Price Match</span>
              </div>
              <h3 className="font-semibold text-white mb-3 text-lg">Competitive Pricing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Guaranteed lowest fares with exclusive deals and special promotions for regular travelers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
