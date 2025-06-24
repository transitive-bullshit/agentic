'use client'

import { Physics, useSphere } from '@react-three/cannon'
import { Environment, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Bloom,
  EffectComposer,
  // N8AO,
  SMAA,
  SSAO
} from '@react-three/postprocessing'
import * as THREE from 'three'

const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({
  color: 'white',
  roughness: 0,
  envMapIntensity: 1
})

export function HeroSimulation2({ className }: { className?: string }) {
  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
      className={className}
    >
      <ambientLight intensity={0.5} />

      <color attach='background' args={['#dfdfdf']} />

      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>

      <Environment files='/adamsbridge.hdr' />

      <EffectComposer enableNormalPass={true} multisampling={0}>
        <SSAO />
        {/* <N8AO
          halfRes
          color='black'
          aoRadius={2}
          intensity={1}
          aoSamples={6}
          denoiseSamples={4}
        /> */}

        <Bloom mipmapBlur levels={7} intensity={0.3} />

        <SMAA />
      </EffectComposer>
    </Canvas>
  )
}

function Clump({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  numBalls = 64
}) {
  const texture = useTexture('/mcp.png')
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)]
  }))

  useFrame((_state, _delta) => {
    for (let i = 0; i < numBalls; i++) {
      // Get current whereabouts of the instanced sphere
      ;(ref.current as any).getMatrixAt(i, mat)
      // ref.current.children[i]!.getM(i, mat)

      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        ?.applyForce(
          vec
            .setFromMatrixPosition(mat)
            .normalize()
            .multiplyScalar(-40)
            .toArray(),
          [0, 0, 0]
        )
    }
  })

  return (
    <instancedMesh
      ref={ref}
      castShadow
      receiveShadow
      args={[sphereGeometry, baubleMaterial, numBalls]}
      material-map={texture}
    />
  )
}

function Pointer() {
  const viewport = useThree((state) => state.viewport)
  const [ref, api] = useSphere(() => ({
    type: 'Kinematic',
    args: [3],
    position: [0, 0, 0]
  }))

  useFrame((state) =>
    api.position.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    )
  )

  return (
    <mesh ref={ref} scale={0.2}>
      <sphereGeometry />
      <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      <pointLight intensity={8} distance={10} />
    </mesh>
  )
}
