"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface UseSpeechRecognitionProps {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onTranscript?: (transcript: string, isFinal: boolean) => void
}

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export function useSpeechRecognition({
  continuous = true,
  interimResults = true,
  lang = "en-US",
  onTranscript,
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser")
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onstart = () => {
      console.log("[Speech] Recognition started")
      setIsListening(true)
    }

    recognition.onend = () => {
      console.log("[Speech] Recognition ended")
      setIsListening(false)

      // Restart if continuous mode
      if (continuous && recognitionRef.current) {
        try {
          recognition.start()
        } catch (err) {
          console.error("[Speech] Error restarting recognition:", err)
        }
      }
    }

    recognition.onerror = (event: any) => {
      // Don't restart on certain errors
      if (event.error === "no-speech") {
        // This is normal - just means user hasn't spoken yet or paused speaking
        console.log("[Speech] No speech detected (waiting for speech...)")
        return
      }

      if (event.error === "audio-capture") {
        console.warn("[Speech] Audio capture issue - check microphone")
        return
      }

      // Other errors are actual problems
      console.error("[Speech] Recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let interimText = ""
      let finalText = ""

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptText = result[0].transcript

        if (result.isFinal) {
          finalText += transcriptText + " "
          console.log("[Speech] Final:", transcriptText)
        } else {
          interimText += transcriptText
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText)
        if (onTranscript) {
          onTranscript(finalText.trim(), true)
        }
      }

      if (interimText) {
        setInterimTranscript(interimText)
        if (onTranscript) {
          onTranscript(interimText.trim(), false)
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [continuous, interimResults, lang, onTranscript])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        console.log("[Speech] Starting recognition...")
      } catch (err) {
        console.error("[Speech] Error starting recognition:", err)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      console.log("[Speech] Stopping recognition...")
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  }
}
