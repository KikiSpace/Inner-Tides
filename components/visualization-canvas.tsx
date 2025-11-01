"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Home } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { getWordExtractor } from "@/utils/wordExtractor"
import { OrcaPopup } from "@/components/orca-popup"
import { LiveCaptions } from "@/components/live-captions"
import { SilenceSurvey } from "@/components/silence-survey"
import type { Orca } from "@/components/p5-wrapper"
import { playRandomOrcaSoundtrack, stopAudio } from "@/utils/orcaAudio"

// Dynamically import p5 wrapper to avoid SSR issues
const P5Wrapper = dynamic(() => import("@/components/p5-wrapper"), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Loading canvas...</div>,
})

const WordBubbleLayer = dynamic(() => import("@/components/word-bubble-layer"), {
  ssr: false,
})

export function VisualizationCanvas() {
  const [isListening, setIsListening] = useState(false)
  const [isSilent, setIsSilent] = useState(false)
  const [emotionalColor, setEmotionalColor] = useState({ r: 100, g: 150, b: 200 })
  const [audioLevel, setAudioLevel] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [selectedOrca, setSelectedOrca] = useState<Orca | null>(null)
  const [surveyOrca, setSurveyOrca] = useState<Orca | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const silenceSoundtrackRef = useRef<HTMLAudioElement | null>(null)

  const isListeningRef = useRef(false)
  const isSilentRef = useRef(false)
  const wordExtractorRef = useRef(getWordExtractor())

  // Speech recognition for word cloud
  const handleTranscript = useCallback((transcript: string, isFinal: boolean) => {
    console.log(`[WordCloud] Transcript (${isFinal ? "final" : "interim"}):`, transcript)

    if (isFinal && transcript.trim().length > 0) {
      // Extract new words from the transcript
      const newWords = wordExtractorRef.current.getNewWords(transcript)
      console.log(`[WordCloud] New words extracted:`, newWords)

      if (newWords.length > 0) {
        // Add new words to state (these will become bubbles)
        setWords((prev) => [...prev, ...newWords])
      }

      // Update word frequencies
      wordExtractorRef.current.extractWords(transcript)
    }
  }, [])

  // Handle orca click
  const handleOrcaClick = useCallback((orca: Orca) => {
    console.log(`[VisualizationCanvas] Orca clicked:`, orca.id)
    setSelectedOrca(orca)
  }, [])

  // Handle orca created (silence detected)
  const handleOrcaCreated = useCallback((orca: Orca) => {
    console.log(`[VisualizationCanvas] Orca created (silence detected):`, orca.id)

    // Play random orca soundtrack with delay to avoid abort errors
    setTimeout(() => {
      try {
        // Stop any currently playing silence soundtrack
        if (silenceSoundtrackRef.current) {
          try {
            stopAudio(silenceSoundtrackRef.current)
          } catch (stopError) {
            // Ignore errors when stopping (audio might not be loaded yet)
            console.log("[VisualizationCanvas] Previous audio already stopped")
          }
        }

        // Play new soundtrack
        silenceSoundtrackRef.current = playRandomOrcaSoundtrack(0.5)
        console.log(`[VisualizationCanvas] Playing silence soundtrack for orca ${orca.id}`)
      } catch (error) {
        console.log("[VisualizationCanvas] Audio playback handled:", error)
      }
    }, 200) // Increased delay to 200ms

    // Show survey popup
    setSurveyOrca(orca)
  }, [])

  const {
    isListening: isSpeechListening,
    isSupported: isSpeechSupported,
    transcript: fullTranscript,
    interimTranscript: currentInterimTranscript,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: "en-US",
    onTranscript: handleTranscript,
  })

  // Initialize audio context and microphone
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.8

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      setIsListening(true)
      isListeningRef.current = true
      console.log("[v0] Started listening to microphone")
      monitorAudio()

      // Start speech recognition for word cloud
      if (isSpeechSupported) {
        startSpeechRecognition()
        console.log("[WordCloud] Started speech recognition")
      } else {
        console.warn("[WordCloud] Speech recognition not supported in this browser")
      }
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
      alert("Unable to access microphone. Please grant permission.")
    }
  }

  const stopListening = useCallback(() => {
    console.log("[v0] Stopping listening")

    isListeningRef.current = false
    isSilentRef.current = false

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop microphone stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }

    // Close audio context only if it exists and is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }
    audioContextRef.current = null
    analyserRef.current = null

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    // Stop speech recognition
    if (isSpeechListening) {
      stopSpeechRecognition()
      console.log("[WordCloud] Stopped speech recognition")
    }

    // Stop any playing silence soundtrack
    if (silenceSoundtrackRef.current) {
      try {
        stopAudio(silenceSoundtrackRef.current)
      } catch (error) {
        // Ignore abort errors when stopping audio
        console.log("[VisualizationCanvas] Audio cleanup handled")
      }
      silenceSoundtrackRef.current = null
    }

    // Reset word cloud
    resetTranscript()
    wordExtractorRef.current.clearAll()
    setWords([])

    setIsListening(false)
    setIsSilent(false)
  }, [isSpeechListening, stopSpeechRecognition, resetTranscript])

  // Monitor audio levels and detect silence
  const monitorAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const checkAudio = () => {
      if (!analyserRef.current || !isListeningRef.current) return

      analyserRef.current.getByteTimeDomainData(dataArray)

      // Calculate audio level
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / dataArray.length)
      const level = Math.min(rms * 10, 1)

      setAudioLevel(level)

      // Map audio characteristics to emotional color
      analyserRef.current.getByteFrequencyData(dataArray)
      const lowFreq = dataArray.slice(0, 85).reduce((a, b) => a + b, 0) / 85
      const midFreq = dataArray.slice(85, 170).reduce((a, b) => a + b, 0) / 85
      const highFreq = dataArray.slice(170, 255).reduce((a, b) => a + b, 0) / 85

      // Emotional color mapping
      const r = Math.floor(100 + (highFreq / 255) * 155)
      const g = Math.floor(120 + (midFreq / 255) * 135)
      const b = Math.floor(150 + (lowFreq / 255) * 105)

      setEmotionalColor({ r, g, b })

      const silenceThreshold = 0.08
      console.log(
        "[v0] Audio level:",
        level.toFixed(4),
        "Threshold:",
        silenceThreshold,
        "Silent:",
        level < silenceThreshold,
      )

      if (level < silenceThreshold) {
        if (!silenceTimerRef.current) {
          console.log("[v0] Silence detected, starting 3 second timer")
          silenceTimerRef.current = setTimeout(() => {
            console.log("[v0] 3 seconds of silence - triggering orca animation")
            setIsSilent(true)
            isSilentRef.current = true
          }, 3000) // 3 seconds of silence
        }
      } else {
        if (silenceTimerRef.current) {
          console.log("[v0] Sound detected, clearing silence timer")
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
        if (isSilentRef.current) {
          console.log("[v0] Exiting silent mode")
          setIsSilent(false)
          isSilentRef.current = false
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudio)
    }

    checkAudio()
  }

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    isSilentRef.current = isSilent
    console.log("[v0] isSilent state changed to:", isSilent)
  }, [isSilent])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FBFBFA]">
      {/* P5.js Canvas for orcas and ripples */}
      <P5Wrapper
        emotionalColor={emotionalColor}
        audioLevel={audioLevel}
        isSilent={isSilent}
        currentWords={words}
        onOrcaClick={handleOrcaClick}
        onOrcaCreated={handleOrcaCreated}
      />

      {/* Word Bubble Layer */}
      {isListening && (
        <WordBubbleLayer words={words} emotionalColor={emotionalColor} />
      )}

      {/* Live Captions */}
      <LiveCaptions
        transcript={fullTranscript}
        interimTranscript={currentInterimTranscript}
        isListening={isListening}
      />

      {/* Silence Survey */}
      <SilenceSurvey
        orca={surveyOrca}
        onClose={() => setSurveyOrca(null)}
        onStopListening={stopListening}
      />

      {/* Orca Popup */}
      <OrcaPopup
        orca={selectedOrca}
        onClose={() => setSelectedOrca(null)}
        onStopListening={stopListening}
      />

      {/* Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 shadow-sm">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link href="/memory">
              <Button variant="ghost" size="sm" className="gap-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 shadow-sm">
                🐋 Memory
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isListening && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm text-sm">
                <div className={`w-2 h-2 rounded-full ${isSilent ? "bg-purple-500" : "bg-blue-500"} animate-pulse`} />
                <span className="text-gray-700 font-medium">{isSilent ? "Silence Detected" : "Listening"}</span>
              </div>
            )}

            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={`gap-2 shadow-sm ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Listening
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Overlay */}
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="relative text-center space-y-4 max-w-md px-8 py-10 mx-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900">Begin Your Journey</h2>
            <p className="text-gray-600 leading-relaxed">
              Click "Start Listening" to begin. Speak, breathe, or simply be still. Watch as your presence transforms
              into living art.
            </p>
          </div>
        </div>
      )}

      {isSilent && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium shadow-sm">
            🐋 Orca echo playing...
          </div>
        </div>
      )}
    </div>
  )
}
