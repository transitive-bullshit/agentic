'use client'

import {
  MarchingCube,
  MarchingCubes,
  MeshTransmissionMaterial,
  RenderTexture,
  Text
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { BallCollider, Physics, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

const inter = import('@pmndrs/assets/fonts/inter_regular.woff')

// https://codesandbox.io/p/sandbox/metaballs-forked-g7xjjq?file=%2Fsrc%2FApp.js

function MetaBall({
  float = false,
  strength = 0.5,
  color,
  vec = new THREE.Vector3(),
  ...props
}: {
  float?: boolean
  strength?: number
  color?: string
  vec?: THREE.Vector3
} & Parameters<typeof RigidBody>[0]) {
  const api = useRef<any>(null)

  useFrame((_state, delta) => {
    if (float) {
      delta = Math.min(delta, 0.1)
      api.current?.applyImpulse(
        vec
          //.set(-state.pointer.x, -state.pointer.y, 0)
          .copy(api.current.translation())
          .normalize()
          .multiplyScalar(delta * -0.2)
      )
    }
  })

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.6}
      linearDamping={4}
      angularDamping={4}
      {...props}
    >
      <MarchingCube
        strength={strength}
        subtract={6}
        color={new THREE.Color(color)}
      />

      <BallCollider args={[0.1]} />
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef<any>(null)

  useFrame(({ pointer, viewport }) => {
    const { width, height } = viewport.getCurrentViewport()
    vec.set((pointer.x * width) / 2, (pointer.y * height) / 2, 0)
    ref.current?.setNextKinematicTranslation(vec)
  })

  return (
    <RigidBody type='kinematicPosition' colliders={false} ref={ref}>
      <BallCollider args={[0.3]} />
    </RigidBody>
  )
}

export function HeroSimulation({ className }: { className?: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 5], zoom: 300 }}
      className={className}
    >
      <color attach='background' args={['blue']} />

      <ambientLight intensity={1} />

      <Physics gravity={[0, -5, 0]}>
        <MarchingCubes
          resolution={40}
          maxPolyCount={10_000}
          enableUvs={false}
          enableColors
        >
          <MeshTransmissionMaterial
            thickness={0.4}
            anisotropicBlur={0.1}
            chromaticAberration={0.1}
            vertexColors
            roughness={0}
          >
            <RenderTexture attach='buffer'>
              <color attach='background' args={[new THREE.Color(2, 2, 2)]} />

              <Text
                scale={0.25}
                fontSize={1}
                position={[0, 0, -5]}
                letterSpacing={-0.025}
                outlineWidth={0.03}
                font={(suspend(inter) as any).default}
                color='black'
              >
                MCP
              </Text>
            </RenderTexture>
          </MeshTransmissionMaterial>

          {Array.from({ length: 10 }, (_, index) => (
            <MetaBall
              float
              strength={1}
              key={'1' + index}
              color='white'
              position={[Math.random() * 0.5, Math.random() * 0.5, 0]}
            />
          ))}

          <Pointer />
        </MarchingCubes>
      </Physics>

      {/* <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr"
        environmentIntensity={0.5}
      /> */}
    </Canvas>
  )
}
