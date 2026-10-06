import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'

const cameraTargets = {
  exterior: { pos: [7.6, 2.7, 7.8], target: [0, 0.55, 0] },
  cockpit: { pos: [-0.55, 1.48, 0.42], target: [4.2, 1.18, 0] },
  rear: { pos: [-6.8, 2.4, -7.2], target: [0, 0.65, 0] },
  detail: { pos: [4.9, 1.65, 3.2], target: [1.25, 0.55, 0.2] }
}

function CameraRig({ view, pointer }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(...cameraTargets[view].target))

  useEffect(() => {
    target.current.set(...cameraTargets[view].target)
  }, [view])

  useFrame((_, delta) => {
    const spec = cameraTargets[view]
    const px = view === 'cockpit' ? pointer.current.x * 0.08 : pointer.current.x * 0.28
    const py = view === 'cockpit' ? pointer.current.y * 0.05 : pointer.current.y * 0.16
    const desired = new THREE.Vector3(spec.pos[0] + px, spec.pos[1] - py, spec.pos[2])
    camera.position.lerp(desired, 1 - Math.pow(0.001, delta))
    camera.lookAt(target.current)
  })
  return null
}

function Wheel({ position, spokes, caliperColor, style }) {
  const radius = style === 'monodisc' ? 0.71 : 0.69
  const width = 0.34
  const spokeArray = useMemo(() => Array.from({ length: spokes }), [spokes])
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 64]} />
        <meshStandardMaterial color="#0c0c0d" roughness={0.86} metalness={0.1} />
      </mesh>
      <mesh position={[0, width * 0.51, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.71, radius * 0.71, 0.06, 64]} />
        <meshPhysicalMaterial color="#8f9495" metalness={1} roughness={0.18} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, width * 0.56, 0]}>
        <cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.07, 32]} />
        <meshStandardMaterial color="#111214" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.17, width * 0.58, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.31]} />
        <meshStandardMaterial color={caliperColor} metalness={0.4} roughness={0.3} />
      </mesh>
      {style !== 'monodisc' && spokeArray.map((_, i) => (
        <mesh key={i} position={[0, width * 0.58, 0]} rotation={[0, (i / spokes) * Math.PI * 2, 0]}>
          <boxGeometry args={[style === 'turbine7' ? 0.09 : 0.055, 0.05, radius * 1.02]} />
          <meshPhysicalMaterial color="#c1c4c3" metalness={1} roughness={0.2} clearcoat={0.5} />
        </mesh>
      ))}
      {style === 'monodisc' && (
        <mesh position={[0, width * 0.61, 0]}>
          <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.035, 64]} />
          <meshPhysicalMaterial color="#b7b9b8" metalness={1} roughness={0.14} />
        </mesh>
      )}
    </group>
  )
}

function Seat({ z, color }) {
  return (
    <group position={[-0.55, 0.88, z]}>
      <RoundedBox args={[0.95, 0.26, 0.72]} radius={0.12} smoothness={5} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.52} clearcoat={0.16} />
      </RoundedBox>
      <RoundedBox args={[0.28, 1.05, 0.72]} radius={0.12} smoothness={5} position={[-0.36, 0.54, 0]} rotation={[0, 0, -0.13]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.52} clearcoat={0.16} />
      </RoundedBox>
      <mesh position={[-0.38, 0.48, 0]}>
        <boxGeometry args={[0.018, 0.88, 0.03]} />
        <meshStandardMaterial color="#b79b6a" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Interior({ color, accent }) {
  return (
    <group>
      <Seat z={0.48} color={color} />
      <Seat z={-0.48} color={color} />
      <RoundedBox args={[0.56, 0.34, 1.9]} radius={0.11} smoothness={5} position={[0.75, 1.38, 0]}>
        <meshPhysicalMaterial color={accent} roughness={0.48} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0.42, 1.43, 0.52]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.31, 0.045, 20, 64]} />
        <meshStandardMaterial color="#171719" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0.46, 1.53, -0.25]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.025, 0.34, 0.92]} />
        <meshPhysicalMaterial color="#111820" roughness={0.08} metalness={0.2} emissive="#18212c" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-0.08, 0.82, 0]}>
        <boxGeometry args={[1.25, 0.2, 0.34]} />
        <meshPhysicalMaterial color="#232326" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0.12, 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.018, 12, 24]} />
        <meshStandardMaterial color="#b79b6a" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  )
}

function Car({ config, view, rotationTarget }) {
  const group = useRef()
  const bodyOpacity = view === 'cockpit' ? 0.14 : 1
  const bodyTransparent = view === 'cockpit'
  const paint = config.paint.color
  const wheelStyle = config.wheel.id

  useFrame((state, delta) => {
    if (!group.current || view === 'cockpit') return
    const idle = Math.sin(state.clock.elapsedTime * 0.32) * 0.035
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, rotationTarget.current + idle, 4, delta)
  })

  const bodyMaterialProps = { color: paint, metalness: 0.72, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, transparent: bodyTransparent, opacity: bodyOpacity, envMapIntensity: 1.3 }

  return (
    <group ref={group} scale={0.95}>
      <group position={[0, 0.18, 0]}>
        <RoundedBox args={[4.9, 0.72, 2.15]} radius={0.35} smoothness={8} position={[0, 0.74, 0]} scale={[1, 1, 0.88]} castShadow receiveShadow>
          <meshPhysicalMaterial {...bodyMaterialProps} />
        </RoundedBox>
        <RoundedBox args={[2.65, 0.62, 1.86]} radius={0.32} smoothness={8} position={[-0.25, 1.28, 0]} castShadow>
          <meshPhysicalMaterial color="#0b0d10" roughness={0.05} metalness={0.1} transmission={0.34} transparent opacity={view === 'cockpit' ? 0.08 : 0.9} />
        </RoundedBox>
        <mesh position={[1.98, 0.92, 0]} rotation={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[0.95, 0.28, 1.72]} />
          <meshPhysicalMaterial {...bodyMaterialProps} />
        </mesh>
        <mesh position={[-2.19, 0.78, 0]} castShadow>
          <boxGeometry args={[0.52, 0.34, 1.85]} />
          <meshPhysicalMaterial {...bodyMaterialProps} />
        </mesh>

        <mesh position={[2.44, 0.88, 0]}>
          <boxGeometry args={[0.025, 0.08, 1.43]} />
          <meshStandardMaterial color="#e8dbc0" emissive="#d9c392" emissiveIntensity={4.2} toneMapped={false} />
        </mesh>
        <mesh position={[-2.46, 0.86, 0]}>
          <boxGeometry args={[0.03, 0.06, 1.52]} />
          <meshStandardMaterial color="#8b0d12" emissive="#ff1a22" emissiveIntensity={4.5} toneMapped={false} />
        </mesh>
        <mesh position={[2.49, 0.52, 0]}>
          <boxGeometry args={[0.02, 0.29, 1.25]} />
          <meshPhysicalMaterial color="#111214" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[0, 0.66, 1.02]}>
          <boxGeometry args={[2.8, 0.025, 0.03]} />
          <meshStandardMaterial color="#b79b6a" metalness={0.9} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.66, -1.02]}>
          <boxGeometry args={[2.8, 0.025, 0.03]} />
          <meshStandardMaterial color="#b79b6a" metalness={0.9} roughness={0.18} />
        </mesh>

        <Interior color={config.interior.color} accent={config.interior.accent} />

        <Wheel position={[1.55, 0.45, 1.02]} spokes={config.wheel.spokes} caliperColor={config.caliper.color} style={wheelStyle} />
        <Wheel position={[-1.55, 0.45, 1.02]} spokes={config.wheel.spokes} caliperColor={config.caliper.color} style={wheelStyle} />
        <Wheel position={[1.55, 0.45, -1.02]} spokes={config.wheel.spokes} caliperColor={config.caliper.color} style={wheelStyle} />
        <Wheel position={[-1.55, 0.45, -1.02]} spokes={config.wheel.spokes} caliperColor={config.caliper.color} style={wheelStyle} />
      </group>
    </group>
  )
}

export default function CarScene({ config, view, scene }) {
  const pointer = useRef({ x: 0, y: 0 })
  const rotationTarget = useRef(0)
  const drag = useRef({ down: false, x: 0 })
  const bg = scene === 'dusk' ? '#15100f' : scene === 'blackroom' ? '#050506' : '#151617'

  return (
    <div className="car-canvas"
      onPointerDown={(e) => { if (view !== 'cockpit') { drag.current = { down: true, x: e.clientX }; e.currentTarget.setPointerCapture?.(e.pointerId) } }}
      onPointerUp={(e) => { drag.current.down = false; e.currentTarget.releasePointerCapture?.(e.pointerId) }}
      onPointerCancel={() => { drag.current.down = false }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        pointer.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2
        pointer.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2
        if (drag.current.down && view !== 'cockpit') {
          const dx = e.clientX - drag.current.x
          rotationTarget.current += dx * 0.008
          drag.current.x = e.clientX
        }
      }}>
      <Canvas shadows dpr={[1, 1.65]} camera={{ position: cameraTargets.exterior.pos, fov: 33 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 13, 28]} />
        <ambientLight intensity={scene === 'blackroom' ? 0.28 : 0.68} />
        <directionalLight position={[6, 8, 4]} intensity={scene === 'dusk' ? 5 : 3.1} color={scene === 'dusk' ? '#ffd8b3' : '#ffffff'} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-4, 2, -5]} intensity={2.3} color={scene === 'gallery' ? '#a8b8c8' : '#8b6d63'} />
        <spotLight position={[0, 7, -3]} intensity={14} angle={0.58} penumbra={0.8} color="#dcc9a6" />
        <Environment preset={scene === 'dusk' ? 'sunset' : 'warehouse'} environmentIntensity={0.75} />
        <CameraRig view={view} pointer={pointer} />
        <Float speed={0.45} rotationIntensity={0.02} floatIntensity={view === 'cockpit' ? 0 : 0.08}>
          <Car config={config} view={view} rotationTarget={rotationTarget} />
        </Float>
        <ContactShadows position={[0, -0.05, 0]} opacity={scene === 'blackroom' ? 0.9 : 0.55} scale={10} blur={2.8} far={5} />
        {scene === 'blackroom' && <Sparkles count={30} scale={[11, 5, 11]} size={1.2} speed={0.18} opacity={0.22} color="#d6c5a5" />}
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  )
}
