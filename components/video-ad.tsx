"use client"

interface VideoAdBannerProps {
  link?: string
  className?: string
}

export function VideoAdBanner({ link, className = '' }: VideoAdBannerProps) {
  const videoContent = (
    <div className={`relative overflow-hidden rounded-2xl shadow-2xl bg-slate-900 ${className}`}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full"
        style={{ height: '400px', objectFit: 'cover', objectPosition: 'center 30%' }}
      >
        <source src="/ads/SkyRithm3.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Gradient from left for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 z-10">
        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
          Fly with Skyrithm
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-xl mb-6">
          Experience seamless flight booking with cutting-edge technology.
        </p>

        {/* Get Started Button with Cyan Glow Effect */}
        <button 
          onClick={() => window.location.href = '/flights'}
          className="relative px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 overflow-hidden group"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all duration-300" />
          
          {/* Pulsing outer glow */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-xl bg-cyan-400/30 animate-pulse transition-opacity duration-300" />
          
          {/* Border with cyan glow */}
          <div className="absolute inset-0 rounded-lg border border-cyan-500/40 group-hover:border-cyan-400/80 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all duration-300" />
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {/* Button text */}
          <span className="relative z-10">Get Started</span>
        </button>
      </div>
    </div>
  )

  return videoContent
}
