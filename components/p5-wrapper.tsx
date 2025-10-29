"use client"

import { useEffect, useRef, useState } from "react"
import p5 from "p5"
import { Orcas3DLayer } from "./orcas-3d-layer"

interface P5WrapperProps {
  emotionalColor: { r: number; g: number; b: number }
  audioLevel: number
  isSilent: boolean
  currentWords: string[]
  onOrcaClick?: (orca: Orca) => void
}

export interface Orca {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  angle: number
  targetAngle: number
  scale: number
  swimPhase: number
  age: number
  noiseOffsetX: number
  noiseOffsetY: number
  opacity: number
  ripples: Array<{ age: number; maxAge: number }>
  // Metadata for captured context
  capturedWords: string[]
  timestamp: number
  isPermanent: boolean
}

export default function P5Wrapper({ emotionalColor, audioLevel, isSilent, currentWords, onOrcaClick }: P5WrapperProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)
  const propsRef = useRef({ emotionalColor, audioLevel, isSilent, currentWords })
  const waterWaveCanvasRef = useRef<HTMLDivElement>(null)
  const waterP5InstanceRef = useRef<p5 | null>(null)

  const [orcas, setOrcas] = useState<Orca[]>([])
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })
  const orcasRef = useRef<Orca[]>([])
  const onOrcaClickRef = useRef(onOrcaClick)

  // Keep orcasRef in sync with state
  useEffect(() => {
    orcasRef.current = orcas
  }, [orcas])

  useEffect(() => {
    onOrcaClickRef.current = onOrcaClick
  }, [onOrcaClick])

  useEffect(() => {
    propsRef.current = { emotionalColor, audioLevel, isSilent, currentWords }
    console.log("[v0] P5 props updated - isSilent:", isSilent)
  }, [emotionalColor, audioLevel, isSilent, currentWords])

  useEffect(() => {
    if (!canvasRef.current) return

    const orcas: Orca[] = []
    let lastSilentState = false

    let frameCount = 0
    let lastFPSCheck = 0

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.pixelDensity(1) // Reduce pixel density for better performance
        p.noStroke()
        p.frameRate(45) // Cap frame rate for better performance
        console.log("[v0] P5 canvas created")

        // Store canvas dimensions for 3D layer
        setCanvasDimensions({ width: p.windowWidth, height: p.windowHeight })
      }

      p.draw = () => {
        const { emotionalColor: color, audioLevel: level, isSilent: silent, currentWords } = propsRef.current

        // Transparent background - let CSS background show through
        p.clear()

        const { r, g, b } = color
        const intensity = level * 255

        if (silent && !lastSilentState) {
          // Random scale for size variation
          const scale = p.random(0.8, 1.3)

          // Start position - choose random area in the middle of the screen
          const startX = p.random(p.width * 0.3, p.width * 0.7)
          const startY = p.random(p.height * 0.3, p.height * 0.7)

          // Random initial swimming angle
          const angle = p.random(p.TWO_PI)

          // Base swimming speed (slower for meditative feel)
          const speed = 0.5

          // Create unique ID for this orca
          const id = `orca-${Date.now()}-${Math.random()}`
          const timestamp = Date.now()

          const newOrca: Orca = {
            id,
            x: startX,
            y: startY,
            velocityX: p.cos(angle) * speed,
            velocityY: p.sin(angle) * speed,
            angle: angle,
            targetAngle: angle,
            scale: scale,
            swimPhase: p.random(p.TWO_PI),
            age: 0,
            noiseOffsetX: p.random(1000),
            noiseOffsetY: p.random(1000),
            opacity: 0,
            ripples: [],
            // Capture context from before silence
            capturedWords: [...currentWords],
            timestamp: timestamp,
            isPermanent: true,
          }
          orcas.push(newOrca)

          const dateStr = new Date(timestamp).toLocaleString()
          console.log(`[v0] 🐋 ORCA APPEARED - Silence detected at ${dateStr}`)
          console.log(`[v0]   Position: (${startX.toFixed(0)}, ${startY.toFixed(0)})`)
          console.log(`[v0]   Angle: ${(angle * 180 / p.PI).toFixed(1)}°`)
          console.log(`[v0]   Captured ${currentWords.length} words: ${currentWords.slice(0, 5).join(', ')}${currentWords.length > 5 ? '...' : ''}`)
          console.log(`[v0]   Total orcas: ${orcas.length}`)
        }
        lastSilentState = silent

        // Update orca positions with organic wandering behavior
        for (let i = orcas.length - 1; i >= 0; i--) {
          const orca = orcas[i]
          orca.age++

          // Orcas are now permanent - no removal based on age

          // Use Perlin noise for organic directional changes
          const noiseScale = 0.003
          const noiseStrength = 0.02
          const noiseAngleX = p.noise(orca.noiseOffsetX) - 0.5
          const noiseAngleY = p.noise(orca.noiseOffsetY) - 0.5

          // Update target angle based on noise
          orca.targetAngle += (noiseAngleX + noiseAngleY) * noiseStrength

          // Gradually turn towards target angle (smooth turning)
          let angleDiff = orca.targetAngle - orca.angle
          // Normalize angle difference to [-PI, PI]
          while (angleDiff > p.PI) angleDiff -= p.TWO_PI
          while (angleDiff < -p.PI) angleDiff += p.TWO_PI
          orca.angle += angleDiff * 0.05 // Slow, smooth turning

          // Update velocity based on current angle
          const baseSpeed = 0.5
          orca.velocityX = p.cos(orca.angle) * baseSpeed
          orca.velocityY = p.sin(orca.angle) * baseSpeed

          // Apply velocity to position
          orca.x += orca.velocityX
          orca.y += orca.velocityY

          // Screen wrapping for continuous swimming
          const margin = 200
          if (orca.x < -margin) orca.x = p.width + margin - 10
          if (orca.x > p.width + margin) orca.x = -margin + 10
          if (orca.y < -margin) orca.y = p.height + margin - 10
          if (orca.y > p.height + margin) orca.y = -margin + 10

          // Gentle avoidance of screen edges (turn away)
          const edgeMargin = 150
          const turnStrength = 0.008
          if (orca.x < edgeMargin) {
            orca.targetAngle += turnStrength * (edgeMargin - orca.x)
          } else if (orca.x > p.width - edgeMargin) {
            orca.targetAngle -= turnStrength * (orca.x - (p.width - edgeMargin))
          }
          if (orca.y < edgeMargin) {
            orca.targetAngle += turnStrength * (edgeMargin - orca.y)
          } else if (orca.y > p.height - edgeMargin) {
            orca.targetAngle -= turnStrength * (orca.y - (p.height - edgeMargin))
          }

          // Update noise offsets for next frame
          orca.noiseOffsetX += noiseScale
          orca.noiseOffsetY += noiseScale

          // Swimming animation phase
          orca.swimPhase += 0.04

          // Spawn ripples periodically (every 18-25 frames)
          if (orca.age % p.floor(p.random(18, 25)) === 0) {
            orca.ripples.push({ age: 0, maxAge: 90 })
          }

          // Update ripples
          orca.ripples = orca.ripples.filter(ripple => {
            ripple.age++
            return ripple.age < ripple.maxAge
          })
        }

        // Draw ripples around each orca
        p.push()
        p.noFill()
        for (const orca of orcas) {
          for (const ripple of orca.ripples) {
            const progress = ripple.age / ripple.maxAge
            const radius = p.map(progress, 0, 1, 20, 180) * orca.scale
            const alpha = p.map(progress, 0, 1, 60, 0)

            // Draw multiple concentric rings for wave effect
            for (let i = 0; i < 3; i++) {
              const ringOffset = i * 8
              const ringAlpha = alpha * (1 - i * 0.3)
              p.stroke(r * 0.8, g * 0.9, b * 1.0, ringAlpha)
              p.strokeWeight(2 - i * 0.5)
              p.ellipse(orca.x, orca.y, (radius + ringOffset) * 2, (radius + ringOffset) * 2)
            }
          }
        }
        p.pop()

        // Update orca opacity
        for (const orca of orcas) {
          // Permanent orcas only fade in, then stay visible
          let opacity = 1.0
          const fadeInDuration = 90 // Longer fade in for smoother emergence

          if (orca.age < fadeInDuration) {
            opacity = p.map(orca.age, 0, fadeInDuration, 0, 1)
          }

          orca.opacity = opacity
        }

        // Sync orcas to React state every few frames for 3D rendering
        if (frameCount % 2 === 0) {
          setOrcas([...orcas])
        }

        // Removed heavy Perlin noise rendering for performance

        // Performance monitoring
        frameCount++
        if (p.millis() - lastFPSCheck > 5000) {
          const fps = p.frameRate()
          console.log(`[v0] Performance - FPS: ${fps.toFixed(1)}, Orcas: ${orcas.length}`)
          lastFPSCheck = p.millis()
        }
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        setCanvasDimensions({ width: p.windowWidth, height: p.windowHeight })
      }
    }

    p5InstanceRef.current = new p5(sketch, canvasRef.current)

    return () => {
      // Clean up p5 instance
      p5InstanceRef.current?.remove()
    }
  }, [])

  // Separate canvas for water wave overlay (simplified for performance)
  useEffect(() => {
    if (!waterWaveCanvasRef.current) return

    let waveOffset = 0

    const waveSketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.style('pointer-events', 'none')
        p.clear()
        p.frameRate(30) // Lower frame rate for better performance
      }

      p.draw = () => {
        const { emotionalColor: color, audioLevel: level } = propsRef.current

        // Clear with transparency
        p.clear()

        const { r, g, b } = color

        p.push()
        p.noFill()

        // Reduced to 8 layers instead of 15
        const waveLayerCount = 8
        const waveHeight = p.height / waveLayerCount

        for (let i = 0; i < waveLayerCount; i++) {
          const baseY = i * waveHeight
          const waveSpeed = waveOffset * (1 + i * 0.1)

          // Create wave gradient - stronger at top, fades towards bottom
          const depthFactor = i / waveLayerCount
          const alpha = p.map(depthFactor, 0, 1, 35, 5)

          // Use emotional colors with cyan tint for water
          const waveR = r * 0.4 + 100
          const waveG = g * 0.6 + 150
          const waveB = b * 0.8 + 200

          p.stroke(waveR, waveG, waveB, alpha)
          p.strokeWeight(1.5 + (1 - depthFactor) * 0.5)

          // Draw flowing wave line with larger steps
          p.beginShape()
          for (let x = 0; x <= p.width; x += 25) { // Increased from 15 to 25
            // Only two sine waves instead of three + noise
            const wave1 = p.sin(x * 0.008 + waveSpeed) * 20
            const wave2 = p.sin(x * 0.004 + waveSpeed * 1.5) * 30

            const y = baseY + wave1 + wave2
            p.vertex(x, y)
          }
          p.endShape()
        }

        p.pop()

        waveOffset += 0.02 + level * 0.02
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }
    }

    waterP5InstanceRef.current = new p5(waveSketch, waterWaveCanvasRef.current)

    return () => {
      waterP5InstanceRef.current?.remove()
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <div ref={canvasRef} className="w-full h-full" />
      {canvasDimensions.width > 0 && (
        <Orcas3DLayer
          orcas={orcas}
          canvasWidth={canvasDimensions.width}
          canvasHeight={canvasDimensions.height}
          onOrcaClick={onOrcaClick}
        />
      )}
      <div
        ref={waterWaveCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20
        }}
      />
    </div>
  )
}
