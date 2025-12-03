"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Plane, MapPin, Users, Mail, Phone, ArrowRight, Download, Share2, AlertCircle, Printer } from "lucide-react"
import type { Booking, Flight } from "@/lib/types"
import gsap from "gsap"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bookingId) {
      console.error("No booking ID provided")
      setLoading(false)
      return
    }

    // CRITICAL: Load from sessionStorage first
    const storedBooking = sessionStorage.getItem(`booking_${bookingId}`)
    
    if (storedBooking) {
      try {
        const parsedBooking = JSON.parse(storedBooking)
        console.log("✅ Loaded booking from sessionStorage:", parsedBooking)
        
        // Set data and mark as loaded
        setBooking(parsedBooking)
        setFlight(parsedBooking.flight)
        setHasLoadedData(true) // CRITICAL FLAG
        setLoading(false)
        
        // Try API fetch in background (won't affect display)
        setTimeout(() => {
          fetch(`/api/bookings/${bookingId}`)
            .then(res => res.json())
            .then(data => {
              console.log("📡 API data received (backup):", data)
              // Optionally update if API has newer data
              if (data.flight) {
                setBooking(data)
                setFlight(data.flight)
              }
              // Clean up sessionStorage after successful API fetch
              sessionStorage.removeItem(`booking_${bookingId}`)
            })
            .catch(err => console.log("API fetch failed (not critical):", err))
        }, 1000)
        
        return // EXIT HERE - we have data, don't try API
      } catch (e) {
        console.error("Error parsing sessionStorage:", e)
      }
    }

    // Only reach here if NO sessionStorage data
    console.log("⚠️ No sessionStorage data, trying API...")
    
    // Try API with retry
    let attempts = 0
    const maxAttempts = 3
    
    const tryFetch = async () => {
      try {
        attempts++
        console.log(`API attempt ${attempts}/${maxAttempts}`)
        
        const response = await fetch(`/api/bookings/${bookingId}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log("✅ API fetch successful:", data)
          
          setBooking(data)
          setFlight(data.flight)
          setHasLoadedData(true)
          setLoading(false)
          return
        } else {
          console.log(`API returned ${response.status}`)
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error(`API attempt ${attempts} failed:`, error)
        
        if (attempts < maxAttempts) {
          // Retry after delay
          setTimeout(tryFetch, 1500 * attempts)
        } else {
          // All attempts failed
          console.error("❌ All API attempts failed")
          setLoading(false)
        }
      }
    }
    
    tryFetch()
  }, [bookingId])

  // GSAP Animations
  useLayoutEffect(() => {
    if (!loading && booking && flight) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

        tl.from(headerRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          ease: "back.out(1.7)",
        })
          .from(cardRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.6,
          }, "-=0.3")
          .from(detailsRef.current?.children || [], {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.1,
          }, "-=0.2")
      }, containerRef)

      return () => ctx.revert()
    }
  }, [loading, booking, flight])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!booking || !flight) return
    
    setIsDownloading(true)
    
    try {
      // Generate a clean HTML ticket
      const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Flight Ticket - ${booking.bookingRef}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; width: 800px; background: white; }
            .header { background: linear-gradient(to right, #10b981, #3b82f6); color: white; padding: 30px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .ref { font-size: 20px; font-weight: bold; margin-top: 10px; }
            .route { display: flex; justify-content: space-between; padding: 30px; background: #f8fafc; border-bottom: 3px dashed #cbd5e1; }
            .location { text-align: center; flex: 1; }
            .city { font-size: 36px; font-weight: bold; color: #1e293b; }
            .time { font-size: 18px; color: #10b981; font-weight: bold; margin-top: 8px; }
            .details { padding: 30px; }
            .passenger { background: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
            .seat { background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
            .footer { background: #1e293b; color: white; text-align: center; padding: 20px; }
            .price { background: #f8fafc; padding: 20px; border-top: 2px dashed #cbd5e1; }
            @media print { body { width: auto; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">✈️ Skyrithm Airlines</div>
            <div>E-Ticket</div>
            <div class="ref">Booking: ${booking.bookingRef}</div>
          </div>
          <div class="route">
            <div class="location">
              <div style="color: #10b981; font-size: 12px; margin-bottom: 10px;">DEPARTURE</div>
              <div class="city">${flight.from}</div>
              <div style="color: #64748b; margin-top: 5px;">${flight.date}</div>
              <div class="time">${flight.departure}</div>
            </div>
            <div class="location">
              <div style="color: #64748b; margin-bottom: 10px;">✈️</div>
              <div style="font-size: 14px; color: #64748b;">${flight.duration}</div>
            </div>
            <div class="location">
              <div style="color: #3b82f6; font-size: 12px; margin-bottom: 10px;">ARRIVAL</div>
              <div class="city">${flight.to}</div>
              <div style="color: #64748b; margin-top: 5px;">${flight.date}</div>
              <div class="time" style="color: #3b82f6;">${flight.arrival}</div>
            </div>
          </div>
          <div class="details">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Flight: ${flight.airline} ${flight.flightNumber}</div>
            <div style="font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; font-size: 12px; color: #64748b;">Passengers</div>
            ${booking.passengers.map((p, i) => `
              <div class="passenger">
                <div>
                  <div style="font-weight: bold; font-size: 16px;">${i + 1}. ${p.name}</div>
                  <div style="color: #64748b; font-size: 14px;">${p.email}</div>
                </div>
                ${p.seatAssignment ? `<div class="seat">SEAT ${p.seatAssignment}</div>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="price">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #64748b;">Total Amount Paid</span>
              <span style="font-size: 24px; font-weight: bold; color: #10b981;">₱${booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div class="footer">
            <div style="margin-bottom: 10px;">Please arrive at the airport at least 2 hours before departure</div>
            <div style="font-size: 12px; opacity: 0.7;">support@skyrithm.com • +63 906 355 7013</div>
          </div>
        </body>
        </html>
      `
      
      // Create blob and download
      const blob = new Blob([ticketHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Skyrithm-Ticket-${booking.bookingRef}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Show success message
      setTimeout(() => {
        alert('✅ Ticket downloaded! Open it in any browser and print to PDF if needed.')
      }, 100)
      
    } catch (error) {
      console.error('Error generating ticket:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!booking || !flight) return
    
    const shareData = {
      title: 'Flight Booking Confirmation',
      text: `My flight booking with Skyrithm Airlines\nBooking Reference: ${booking.bookingRef}\nRoute: ${flight.from} → ${flight.to}`,
      url: window.location.href,
    }

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Booking link copied to clipboard!')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // If share was cancelled, don't show error
        console.error('Error sharing:', error)
        
        // Final fallback: try to copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href)
          alert('✅ Booking link copied to clipboard!')
        } catch {
          alert('Unable to share. Please copy the URL from your browser.')
        }
      }
    }
  }

  // CRITICAL: Only show error if we truly have no data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
            <Plane className="absolute inset-0 m-auto w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-lg">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (!hasLoadedData || !booking || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Booking Not Found</h2>
          <p className="text-slate-400 mb-6">
            Your booking may have been completed successfully. Please check your email or bookings page.
          </p>
          <div className="flex gap-4">
            <a
              href="/bookings"
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition text-center"
            >
              View My Bookings
            </a>
            <a
              href="/flights"
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition text-center"
            >
              Book New Flight
            </a>
          </div>
        </div>
      </div>
    )
  }

  // At this point, we DEFINITELY have data
  return (
    <section
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div ref={headerRef} className="text-center mb-8">
          <div className="w-28 h-28 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <CheckCircle className="w-14 h-14 text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Booking Confirmed! 🎉</h1>
          <p className="text-slate-400 text-xl">
            Your flight reservation is complete. Check your email for details.
          </p>
        </div>

        {/* Booking Reference Card */}
        <div
          ref={cardRef}
          className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400 mb-2">BOOKING REFERENCE</p>
              <p className="text-4xl md:text-5xl font-bold text-white tracking-wider">{booking.bookingRef}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group"
                title="Print Ticket"
              >
                <Printer className="w-6 h-6 text-slate-300 group-hover:text-white" />
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Ticket"
              >
                {isDownloading ? (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-6 h-6 text-slate-300 group-hover:text-white" />
                )}
              </button>
              <button 
                onClick={handleShare}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group"
                title="Share"
              >
                <Share2 className="w-6 h-6 text-slate-300 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Flight & Passenger Details */}
        <div ref={detailsRef} className="space-y-6">
          {/* Flight Details Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Plane className="w-7 h-7 text-emerald-400" />
                Flight Information
              </h2>
            </div>
            
            <div className="p-8">
              {/* Route Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Departure</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">{flight.from}</p>
                  <p className="text-slate-400 text-lg">{flight.date}</p>
                  <p className="text-emerald-400 font-semibold text-xl mt-2">{flight.departure}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <Plane className="w-8 h-8 text-slate-500 mb-4 rotate-90" />
                  <div className="w-full max-w-xs h-1 bg-gradient-to-r from-emerald-500 via-slate-600 to-blue-500 rounded-full relative">
                    <div className="absolute -top-2.5 left-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" />
                    <div className="absolute -top-2.5 right-0 w-6 h-6 bg-blue-500 rounded-full border-4 border-slate-900" />
                  </div>
                  <p className="text-sm text-slate-400 mt-4 font-semibold">{flight.duration}</p>
                </div>

                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-3 mb-4">
                    <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Arrival</span>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">{flight.to}</p>
                  <p className="text-slate-400 text-lg">{flight.date}</p>
                  <p className="text-blue-400 font-semibold text-xl mt-2">{flight.arrival}</p>
                </div>
              </div>

              {/* Flight Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Plane className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Flight Number</p>
                    <p className="text-xl font-bold text-white">{flight.airline} {flight.flightNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total Passengers</p>
                    <p className="text-xl font-bold text-white">{booking.passengers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-purple-400" />
                Passenger Details
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {booking.passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900/50 rounded-xl border border-slate-700/30 gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white mb-1">{passenger.name}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <span className="text-sm text-slate-400 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {passenger.email}
                        </span>
                        {passenger.phone && (
                          <span className="text-sm text-slate-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {passenger.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {passenger.seatAssignment && (
                    <div className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                      <p className="text-xs text-emerald-400 mb-1">SEAT</p>
                      <p className="text-2xl font-bold text-emerald-400">{passenger.seatAssignment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300 text-lg">
                <span>Base Fare ({booking.passengers.length}x)</span>
                <span>₱{(flight.price * booking.passengers.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-lg">
                <span>Taxes & Fees</span>
                <span>₱{(45 * booking.passengers.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-slate-700/50">
                <span>Total Paid</span>
                <span className="text-emerald-400">₱{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center">
            <p className="text-slate-300 mb-4 text-lg">Need help with your booking?</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="mailto:support@skyrithm.com"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-lg"
              >
                <Mail className="w-5 h-5" />
                support@skyrithm.com
              </a>
              <span className="hidden md:inline text-slate-600">•</span>
              <a
                href="tel:+639063557013"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-lg"
              >
                <Phone className="w-5 h-5" />
                +63 906 355 7013
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <a
              href="/bookings"
              className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all text-center"
            >
              View All My Bookings
            </a>
            <a
              href="/flights"
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              Book Another Flight
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
