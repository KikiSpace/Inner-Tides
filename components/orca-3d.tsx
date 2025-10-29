"use client"

import { useRef, useEffect, useState } from 'react'
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import type { Orca } from './p5-wrapper'

interface Orca3DProps {
  orca: Orca
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  swimPhase: number
  opacity: number
  onClick?: () => void
}

export function Orca3D({ orca, position, rotation, scale, swimPhase, opacity, onClick }: Orca3DProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Load the 3D model
  const gltf = useLoader(GLTFLoader, '/models/orca.glb')

  // Change cursor on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  useEffect(() => {
    if (meshRef.current && gltf) {
      // Set up materials with transparency
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial
            material.transparent = true
            material.opacity = opacity
          }
        }
      })
    }
  }, [gltf, opacity])

  // Animate swimming motion
  useFrame(() => {
    if (meshRef.current) {
      // Tail swing animation
      const tailSwing = Math.sin(swimPhase) * 0.15
      meshRef.current.rotation.y = rotation[1] + tailSwing

      // Body undulation
      const undulation = Math.sin(swimPhase + Math.PI / 2) * 0.05
      meshRef.current.rotation.z = undulation

      // Update opacity
      meshRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial
            material.opacity = opacity
          }
        }
      })
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onClick) {
      console.log(`[Orca3D] Clicked orca ${orca.id}`)
      onClick()
    }
  }

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.1 : scale}
    >
      {/* Invisible larger hitbox for easier clicking */}
      <mesh
        visible={false}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Large sphere hitbox - 3x the size of the orca */}
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Actual 3D model */}
      <primitive object={gltf.scene.clone()} />
    </group>
  )
}
