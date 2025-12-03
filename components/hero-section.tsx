"use client"

import { useEffect, useRef } from "react"
import { Plane, MapPin, Clock, Shield, Award, TrendingDown, ArrowRight, Sparkles } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const bottomCtaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial load animations (existing)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
      })
        .from(subtitleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
        }, "-=0.6")
        .from(ctaRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
        }, "-=0.4")

      // Stats scroll animation
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 50,
          scale: 0.8,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        })
      }

      // Feature cards scroll animation
      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 60,
          rotation: -5,
          scale: 0.9,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        })
      }

      // Bottom CTA scroll animation with fade and slide up
      if (bottomCtaRef.current) {
        gsap.from(bottomCtaRef.current, {
          scrollTrigger: {
            trigger: bottomCtaRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 80,
          scale: 0.95,
          duration: 1,
          ease: "power3.out",
        })
      }

      // Parallax effect on background blobs
      gsap.utils.toArray(".parallax-blob").forEach((blob: any) => {
        gsap.to(blob, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: (i) => i * 50 + 100,
          ease: "none",
        })
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: MapPin,
      title: "50+ Destinations",
      description: "Fly to over 50 destinations throughout the Philippines and overseas with competitive rates.",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: Clock,
      title: "24/7 Booking",
      description: "Book anytime with our always-on platform. Instant confirmation and real-time updates.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: TrendingDown,
      title: "Best Prices",
      description: "Guaranteed lowest fares with exclusive deals and special promotions for travelers.",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Advanced security protocols and encrypted transactions ensure your data is protected.",
      gradient: "from-orange-500/10 to-red-500/10",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
  ]

  const stats = [
    { label: "Destinations", value: "50+", icon: MapPin },
    { label: "Happy Travelers", value: "10K+", icon: Award },
    { label: "Flights Booked", value: "25K+", icon: Plane },
  ]

  return (
    <section 
      ref={heroRef}
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden py-12"
    >
      {/* Animated Background Elements with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="parallax-blob absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="parallax-blob absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="parallax-blob absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Trusted by 10,000+ Travelers</span>
          </div>

          {/* Main Title */}
          <h1 
            ref={titleRef}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Journey Starts
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Here with Skyrithm
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Experience seamless flight booking to over 50 destinations across the Philippines and overseas. Fast, reliable, and built for modern travelers.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/flights"
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 flex items-center gap-2"
            >
              Book Your Flight
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/flights"
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Plane className="w-5 h-5" />
              Explore Destinations
            </a>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex flex-wrap items-center justify-center gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div ref={bottomCtaRef} className="text-center">
          <div className="inline-block bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Take Off?</h2>
            <p className="text-slate-400 mb-6">
              Join thousands of satisfied travelers who trust Skyrithm for their flight booking needs.
            </p>
            <a
              href="/flights"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plane className="w-5 h-5" />
              Start Booking Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
