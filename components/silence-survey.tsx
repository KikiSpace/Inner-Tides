"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Orca } from "./p5-wrapper"
import { saveSurveyResponse } from "@/utils/surveyStorage"
import { generateMemoryImage, generatePlaceholderImage } from "@/utils/imageGeneration"

interface SilenceSurveyProps {
  orca: Orca | null
  onClose: () => void
  onStopListening?: () => void
}

const FEELING_OPTIONS = [
  { value: "happy", label: "Happy 😊", description: "Feeling joyful and content" },
  { value: "calm", label: "Calm 😌", description: "Feeling peaceful and relaxed" },
  { value: "peaceful", label: "Peaceful 🕊️", description: "Feeling serene and tranquil" },
  { value: "nervous", label: "Nervous 😰", description: "Feeling anxious or uneasy" },
  { value: "excited", label: "Excited 🎉", description: "Feeling energized and enthusiastic" },
  { value: "thoughtful", label: "Thoughtful 🤔", description: "Feeling reflective and contemplative" },
]

export function SilenceSurvey({ orca, onClose, onStopListening }: SilenceSurveyProps) {
  const [activity, setActivity] = useState("")
  const [feeling, setFeeling] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasStoppedListeningRef = useRef(false)
  const onStopListeningRef = useRef(onStopListening)

  // Update ref when callback changes
  useEffect(() => {
    onStopListeningRef.current = onStopListening
  }, [onStopListening])

  // Stop listening when survey opens
  useEffect(() => {
    if (orca) {
      // Stop listening to microphone (only once when survey opens)
      if (onStopListeningRef.current && !hasStoppedListeningRef.current) {
        hasStoppedListeningRef.current = true
        onStopListeningRef.current()
        console.log("[SilenceSurvey] Stopped listening to microphone")
      }
    } else {
      // Reset flag when survey closes
      hasStoppedListeningRef.current = false
    }
  }, [orca?.id])

  // Reset form when orca changes
  useEffect(() => {
    if (orca) {
      setActivity("")
      setFeeling("")
      setIsSubmitting(false)
    }
  }, [orca?.id])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (orca) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [orca, onClose])

  if (!orca) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activity.trim() || !feeling) {
      alert("Please answer both questions")
      return
    }

    setIsSubmitting(true)

    try {
      // Generate AI image based on activity and feeling
      console.log("[SilenceSurvey] Generating memory image...")
      const imageUrl = await generateMemoryImage({
        activity: activity.trim(),
        feeling: feeling,
      })

      // If image generation fails, use placeholder
      const finalImageUrl = imageUrl || generatePlaceholderImage(activity.trim(), feeling)

      if (!imageUrl) {
        console.info("[SilenceSurvey] Using placeholder image (configure NEXT_PUBLIC_HF_API_TOKEN for AI-generated images)")
      }

      // Save survey response with image
      saveSurveyResponse({
        id: `survey-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        activity: activity.trim(),
        feeling: feeling,
        orcaId: orca.id,
        capturedWordsCount: orca.capturedWords.length,
        imageUrl: finalImageUrl,
      })

      console.log("[SilenceSurvey] Survey saved with image")

      // Show success message briefly
      setTimeout(() => {
        onClose()
      }, 800)
    } catch (error) {
      console.error("[SilenceSurvey] Error during submission:", error)
      alert("Error saving survey. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    console.log("[Survey] User skipped survey for orca", orca.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🌊</span>
                Moment of Silence
              </h2>
              <p className="mt-2 text-sm text-white/70">
                We'd love to learn more about your silent moments
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question 1: Activity */}
          <div className="space-y-3">
            <label htmlFor="activity" className="block text-lg font-semibold text-white">
              1. What are you doing right now?
            </label>
            <textarea
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="E.g., meditating, working, taking a break..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Question 2: Feeling */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-white">
              2. What are you feeling right now?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FEELING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFeeling(option.value)}
                  disabled={isSubmitting}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    feeling === option.value
                      ? "bg-white/20 border-white/60 shadow-lg"
                      : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40"
                  }`}
                >
                  <div className="text-base font-medium text-white">{option.label}</div>
                  <div className="text-xs text-white/60 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !activity.trim() || !feeling}
              className="flex-1 bg-white text-purple-900 hover:bg-white/90 font-semibold"
            >
              {isSubmitting ? "Generating memory..." : "Submit"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 pt-0 text-center text-xs text-white/50">
          <p>Your responses are stored locally and help us understand moments of silence.</p>
        </div>
      </div>
    </div>
  )
}
