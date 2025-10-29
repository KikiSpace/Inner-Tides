"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import type { Orca } from "./p5-wrapper"
import { playRandomOrcaSoundtrack, stopAudio } from "@/utils/orcaAudio"

interface OrcaPopupProps {
  orca: Orca | null
  onClose: () => void
  onStopListening?: () => void
}

export function OrcaPopup({ orca, onClose, onStopListening }: OrcaPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasStoppedListeningRef = useRef(false)
  const onStopListeningRef = useRef(onStopListening)

  // Update ref when callback changes
  useEffect(() => {
    onStopListeningRef.current = onStopListening
  }, [onStopListening])

  // Play random soundtrack and stop listening when popup opens
  useEffect(() => {
    if (orca) {
      // Stop listening to microphone (only once when popup opens)
      if (onStopListeningRef.current && !hasStoppedListeningRef.current) {
        hasStoppedListeningRef.current = true
        onStopListeningRef.current()
        console.log("[OrcaPopup] Stopped listening to microphone")
      }

      // Play random orca soundtrack with slight delay to avoid abort errors
      const timer = setTimeout(() => {
        audioRef.current = playRandomOrcaSoundtrack(0.6)
        console.log(`[OrcaPopup] Playing soundtrack for orca ${orca.id}`)
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    } else {
      // Reset flag when popup closes
      hasStoppedListeningRef.current = false
    }
  }, [orca?.id]) // Only depend on orca ID

  // Separate effect for cleanup
  useEffect(() => {
    return () => {
      // Stop audio when popup closes
      if (audioRef.current) {
        // Use try-catch to handle any abort errors gracefully
        try {
          stopAudio(audioRef.current)
          console.log("[OrcaPopup] Stopped soundtrack")
        } catch (error) {
          // Ignore abort errors
          console.log("[OrcaPopup] Audio cleanup (already stopped)")
        }
      }
    }
  }, [])

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

  const formattedDate = new Date(orca.timestamp).toLocaleString()
  const timeAgo = getTimeAgo(orca.timestamp)

  // Group words by frequency (in this case, all unique words have frequency 1)
  const wordGroups = orca.capturedWords.reduce((acc, word) => {
    const len = word.length
    if (!acc[len]) acc[len] = []
    acc[len].push(word)
    return acc
  }, {} as Record<number, string[]>)

  // Sort by word length (longer words = larger)
  const sortedLengths = Object.keys(wordGroups)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={popupRef}
        className="relative max-w-3xl w-full max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 pb-4 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🐋</span>
                Orca Memory
              </h2>
              <div className="mt-2 space-y-1 text-sm text-white/70">
                <p>
                  <span className="font-semibold text-white/90">Appeared:</span> {formattedDate}
                </p>
                <p>
                  <span className="font-semibold text-white/90">Time ago:</span> {timeAgo}
                </p>
                <p>
                  <span className="font-semibold text-white/90">Words captured:</span>{" "}
                  {orca.capturedWords.length}
                </p>
              </div>
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

        {/* Word Cloud */}
        <div className="p-6 pt-4">
          {orca.capturedWords.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p className="text-lg">No words were captured before this silence.</p>
              <p className="text-sm mt-2">
                This orca appeared when you first started or didn't speak yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white/90 mb-4">
                Words spoken before silence:
              </h3>

              {/* Word cloud visualization */}
              <div className="flex flex-wrap gap-2 justify-center items-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                {sortedLengths.map((length) => {
                  const words = wordGroups[length]
                  const fontSize = Math.max(14, Math.min(32, length * 2.5))

                  return words.map((word, idx) => {
                    // Random color tint
                    const hue = (word.charCodeAt(0) * 137.5) % 360
                    const color = `hsl(${hue}, 70%, 75%)`

                    return (
                      <span
                        key={`${word}-${idx}`}
                        className="inline-block px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 cursor-default"
                        style={{
                          fontSize: `${fontSize}px`,
                          color: color,
                          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      >
                        {word}
                      </span>
                    )
                  })
                })}
              </div>

              {/* Word list */}
              <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/10">
                <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
                  All Words ({orca.capturedWords.length})
                </h4>
                <p className="text-white/80 leading-relaxed">
                  {orca.capturedWords.join(" • ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 pb-4 text-center text-xs text-white/50">
          <p>This orca appeared during a moment of silence in your conversation.</p>
          <p className="mt-1">Click outside or press ESC to close.</p>
        </div>
      </div>
    </div>
  )
}

// Helper function to get time ago
function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  if (seconds > 5) return `${seconds} second${seconds > 1 ? "s" : ""} ago`
  return "just now"
}
