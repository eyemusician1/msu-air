"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { updateUser } from "@/lib/firestore"
import type { User } from "@/lib/types"

interface ProfileFormProps {
  userProfile: User
}

function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Updated</h3>
            <p className="text-sm text-gray-600 mt-1">Your changes have been saved successfully</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileForm({ userProfile }: ProfileFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    displayName: userProfile.displayName || "",
    phone: userProfile.phone || "",
    passport: userProfile.passport || "",
    email: userProfile.email || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      await updateUser(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        passport: formData.passport,
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="John Doe"
          />
          <p className="text-xs text-gray-500">Your name as it appears in your identification documents</p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed opacity-60"
          />
          <p className="text-xs text-gray-500">
            Email cannot be changed.{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Contact support
            </a>{" "}
            for email changes.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="+1 (555) 123-4567"
          />
          <p className="text-xs text-gray-500">Used for booking confirmations and contact purposes</p>
        </div>

        {/* Passport */}
        <div className="space-y-2">
          <label htmlFor="passport" className="block text-sm font-semibold text-gray-900">
            Passport Number
          </label>
          <input
            type="text"
            id="passport"
            name="passport"
            value={formData.passport}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="ABC123456"
          />
          <p className="text-xs text-gray-500">Required for international flight bookings and identification</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-900 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </>
  )
}
