"use client"

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Orca3D } from './orca-3d'
import type { Orca } from './p5-wrapper'

interface Orcas3DLayerProps {
  orcas: Orca[]
  canvasWidth: number
  canvasHeight: number
  onOrcaClick?: (orca: Orca) => void
}

export function Orcas3DLayer({ orcas, canvasWidth, canvasHeight, onOrcaClick }: Orcas3DLayerProps) {
  // Convert 2D screen coordinates to 3D world coordinates
  const screenTo3D = (x: number, y: number): [number, number, number] => {
    // Normalize to -1 to 1 range
    const normalizedX = (x / canvasWidth) * 2 - 1
    const normalizedY = -((y / canvasHeight) * 2 - 1) // Flip Y axis

    // Scale to a reasonable 3D space
    const worldX = normalizedX * 10
    const worldY = normalizedY * 5
    const worldZ = 0

    return [worldX, worldY, worldZ]
  }

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 10, pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          {orcas.map((orca) => {
            const position3D = screenTo3D(orca.x, orca.y)
            const rotation: [number, number, number] = [0, orca.angle, 0]

            return (
              <Orca3D
                key={orca.id}
                orca={orca}
                position={position3D}
                rotation={rotation}
                scale={orca.scale * 0.3} // Scale down for appropriate size
                swimPhase={orca.swimPhase}
                opacity={orca.opacity}
                onClick={() => onOrcaClick?.(orca)}
              />
            )
          })}
        </Suspense>
      </Canvas>
    </div>
  )
}
