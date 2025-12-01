"use client"

interface VideoAdBannerProps {
  link?: string
  className?: string
}

export function VideoAdBanner({ link, className = '' }: VideoAdBannerProps) {
  const videoContent = (
    <div className={`relative overflow-hidden rounded-lg shadow-2xl bg-slate-900 ${className}`}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full"
        style={{ 
          height: '350px',
          objectFit: 'cover',
          objectPosition: 'center 30%'
        }}
      >
        <source src="/ads/SkyRithm.mp4" type="video/mp4" />
      </video>

      {/* Vignette effect - darkens edges, keeps center brighter */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black/70" />

        {/* Additional gradient for text side */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      

      
      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
          Fly with Skyrithm
        </h2>
        <p className="text-lg md:text-xl text-gray-100 max-w-2xl drop-shadow-xl">
          Experience seamless flight booking with cutting-edge technology.
        </p>
      </div>
    </div>
  )
  return videoContent
}
