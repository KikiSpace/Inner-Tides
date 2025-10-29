"use client"

import { useEffect, useState } from "react"

interface LiveCaptionsProps {
  transcript: string
  interimTranscript: string
  isListening: boolean
}

export function LiveCaptions({ transcript, interimTranscript, isListening }: LiveCaptionsProps) {
  const [displayText, setDisplayText] = useState("")
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Combine final and interim transcripts
    const fullText = transcript + (interimTranscript ? " " + interimTranscript : "")

    if (fullText.trim()) {
      setDisplayText(fullText)
      setIsFading(false)
    } else if (displayText && !fullText.trim()) {
      // Fade out when text clears
      setIsFading(true)
      const timer = setTimeout(() => {
        setDisplayText("")
        setIsFading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [transcript, interimTranscript, displayText])

  if (!isListening || !displayText.trim()) return null

  // Get the last few words for display (to keep it readable)
  const words = displayText.trim().split(/\s+/)
  const maxWords = 15
  const displayWords = words.slice(-maxWords).join(" ")
  const hasMore = words.length > maxWords

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35 max-w-4xl w-full px-6 transition-all duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        {/* Main caption container */}
        <div className="relative bg-black/70 backdrop-blur-xl rounded-2xl px-8 py-6 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Caption text */}
          <div className="text-center space-y-2">
            {hasMore && (
              <div className="text-white/50 text-sm mb-2">...</div>
            )}

            <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed tracking-wide">
              {/* Final transcript (solid white) */}
              {transcript && (
                <span className="text-white">
                  {transcript.split(/\s+/).slice(-maxWords).join(" ")}
                </span>
              )}

              {/* Interim transcript (dimmer, pulsing) */}
              {interimTranscript && (
                <span className="text-white/70 animate-pulse ml-2">
                  {interimTranscript}
                </span>
              )}
            </p>

            {/* Visual indicator */}
            <div className="flex items-center justify-center gap-1 mt-3">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10 animate-pulse" />
      </div>
    </div>
  )
}
