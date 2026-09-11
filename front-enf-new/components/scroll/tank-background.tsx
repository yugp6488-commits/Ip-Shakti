'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, MeshDistortMaterial } from '@react-three/drei'

/**
 * Fixed, full-bleed WebGL backdrop that sits behind all DOM content.
 * A single distorted sphere gives a dark, gooey / underwater-room feel.
 */
export function TankBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-zinc-950" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#4a90e2" />
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          {/* This creates the gooey / underwater distortion vibe */}
          <MeshDistortMaterial
            color="#0f172a"
            attach="material"
            distort={0.6} // how wavy it is
            speed={1.5} // how fast it undulates
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
