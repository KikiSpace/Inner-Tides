"use client"

import { useEffect, useRef } from "react"
import p5 from "p5"

export interface WordBubble {
  id: string
  text: string
  x: number
  y: number
  velocityY: number
  velocityX: number
  size: number
  opacity: number
  age: number
  maxAge: number
  frequency: number
  emotion: "positive" | "negative" | "neutral"
}

interface WordBubbleLayerProps {
  words: string[]
  emotionalColor: { r: number; g: number; b: number }
  onAddBubble?: (word: string) => void
}

export default function WordBubbleLayer({
  words,
  emotionalColor,
  onAddBubble,
}: WordBubbleLayerProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)
  const bubblesRef = useRef<WordBubble[]>([])
  const wordsRef = useRef<string[]>([])
  const emotionalColorRef = useRef(emotionalColor)
  const maxBubbles = 20 // Limit max concurrent bubbles for performance

  // Update refs
  useEffect(() => {
    emotionalColorRef.current = emotionalColor
  }, [emotionalColor])

  useEffect(() => {
    // Find new words and create bubbles for them
    const newWords = words.filter((word) => !wordsRef.current.includes(word))

    if (newWords.length > 0 && p5InstanceRef.current) {
      const p = p5InstanceRef.current

      newWords.forEach((word) => {
        // Skip if we're at max bubbles limit
        if (bubblesRef.current.length >= maxBubbles) {
          console.log(`[WordBubble] Max bubbles (${maxBubbles}) reached, skipping: "${word}"`)
          return
        }

        // Random starting position at bottom
        const x = p.random(p.width * 0.1, p.width * 0.9)
        const y = p.height + 50

        // Size based on word length (larger for longer words)
        const baseSize = p.map(word.length, 3, 12, 30, 80)

        // Emotion-based color
        const emotion = getWordEmotion(word)

        const bubble: WordBubble = {
          id: `${word}-${Date.now()}-${Math.random()}`,
          text: word,
          x: x,
          y: y,
          velocityY: p.random(-1.5, -0.8), // Float upward
          velocityX: p.random(-0.3, 0.3), // Slight horizontal drift
          size: baseSize,
          opacity: 0,
          age: 0,
          maxAge: p.random(300, 450), // Reduced lifetime for faster cleanup
          frequency: 1,
          emotion: emotion,
        }

        bubblesRef.current.push(bubble)
        console.log(`[WordBubble] New bubble created: "${word}" at (${x.toFixed(0)}, ${y.toFixed(0)})`)

        if (onAddBubble) {
          onAddBubble(word)
        }
      })
    }

    wordsRef.current = words
  }, [words, onAddBubble, maxBubbles])

  useEffect(() => {
    if (!canvasRef.current) return

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.style("pointer-events", "none")
        p.textAlign(p.CENTER, p.CENTER)
        p.textFont("Inter, system-ui, sans-serif")
        p.frameRate(30) // Lower frame rate for better performance
        console.log("[WordBubble] Canvas created")
      }

      p.draw = () => {
        p.clear()

        const { r, g, b } = emotionalColorRef.current

        // Update and draw bubbles
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
          const bubble = bubblesRef.current[i]
          bubble.age++

          // Remove old bubbles
          if (bubble.age > bubble.maxAge) {
            bubblesRef.current.splice(i, 1)
            continue
          }

          // Update position
          bubble.x += bubble.velocityX
          bubble.y += bubble.velocityY

          // Add gentle wave motion
          const waveOffset = p.sin(bubble.age * 0.05 + bubble.x * 0.01) * 0.5
          bubble.x += waveOffset

          // Fade in/out
          const fadeInDuration = 30
          const fadeOutDuration = 60

          if (bubble.age < fadeInDuration) {
            bubble.opacity = p.map(bubble.age, 0, fadeInDuration, 0, 1)
          } else if (bubble.age > bubble.maxAge - fadeOutDuration) {
            bubble.opacity = p.map(
              bubble.age,
              bubble.maxAge - fadeOutDuration,
              bubble.maxAge,
              1,
              0
            )
          } else {
            bubble.opacity = 1
          }

          // Get color based on emotion
          let bubbleColor = { r, g, b }
          if (bubble.emotion === "positive") {
            bubbleColor = {
              r: r * 0.6 + 100,
              g: g * 0.8 + 150,
              b: b * 0.5 + 50,
            }
          } else if (bubble.emotion === "negative") {
            bubbleColor = {
              r: r * 1.2 + 50,
              g: g * 0.4,
              b: b * 0.8 + 100,
            }
          }

          // Draw bubble background
          p.push()
          p.fill(
            bubbleColor.r * 0.3,
            bubbleColor.g * 0.3,
            bubbleColor.b * 0.3,
            bubble.opacity * 150
          )
          p.noStroke()
          p.ellipse(bubble.x, bubble.y, bubble.size * 1.4, bubble.size * 1.4)

          // Draw bubble border (like water bubble)
          p.noFill()
          p.stroke(bubbleColor.r, bubbleColor.g, bubbleColor.b, bubble.opacity * 180)
          p.strokeWeight(2)
          p.ellipse(bubble.x, bubble.y, bubble.size * 1.4, bubble.size * 1.4)

          // Draw shimmer highlight
          p.fill(255, 255, 255, bubble.opacity * 100)
          p.noStroke()
          p.ellipse(
            bubble.x - bubble.size * 0.2,
            bubble.y - bubble.size * 0.2,
            bubble.size * 0.3,
            bubble.size * 0.3
          )

          // Draw text
          p.fill(255, 255, 255, bubble.opacity * 255)
          p.noStroke()
          p.textSize(p.map(bubble.size, 30, 80, 14, 28))
          p.text(bubble.text, bubble.x, bubble.y)

          p.pop()
        }

        // Log bubble count occasionally
        if (p.frameCount % 120 === 0 && bubblesRef.current.length > 0) {
          console.log(`[WordBubble] Active bubbles: ${bubblesRef.current.length}`)
        }
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }
    }

    p5InstanceRef.current = new p5(sketch, canvasRef.current)

    return () => {
      p5InstanceRef.current?.remove()
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
    />
  )
}

// Helper function to determine word emotion
function getWordEmotion(word: string): "positive" | "negative" | "neutral" {
  const positiveWords = new Set([
    "happy", "joy", "love", "peace", "calm", "beautiful", "wonderful",
    "amazing", "good", "great", "excellent", "fantastic", "perfect",
    "hope", "dream", "light", "bright", "warm", "smile", "laugh",
    "thanks", "grateful", "blessed", "lucky", "excited", "inspired"
  ])

  const negativeWords = new Set([
    "sad", "angry", "fear", "pain", "hurt", "dark", "cold", "lonely",
    "bad", "terrible", "awful", "horrible", "hate", "worry", "stress",
    "anxious", "scared", "afraid", "cry", "lost", "angry", "upset",
    "depressed", "nervous", "difficult", "hard", "tough"
  ])

  const normalized = word.toLowerCase()

  if (positiveWords.has(normalized)) return "positive"
  if (negativeWords.has(normalized)) return "negative"
  return "neutral"
}
