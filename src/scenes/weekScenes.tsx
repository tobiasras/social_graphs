import { useMemo, useRef, useState, type ComponentType } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Line, Sparkles, Stars, useCursor } from "@react-three/drei"
import type { Mesh } from "three"

function fibonacciSphere(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    ] as [number, number, number]
  })
}

function Week1Scene() {
  const mesh = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.x += delta * 0.35
    mesh.current.rotation.y += delta * 0.55
  })

  return (
    <>
      <mesh ref={mesh}>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshStandardMaterial
          color="#7c9cff"
          metalness={0.45}
          roughness={0.22}
        />
      </mesh>
      <Float speed={2} floatIntensity={0.6}>
        <mesh position={[2.4, 0.4, 0]}>
          <icosahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color="#f0abfc" metalness={0.3} roughness={0.3} />
        </mesh>
      </Float>
      <mesh position={[-2.3, -0.6, 0.4]} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[0.55, 0.18, 16, 48]} />
        <meshStandardMaterial color="#67e8f9" metalness={0.5} roughness={0.2} />
      </mesh>
    </>
  )
}

function OrbitingNode({
  radius,
  speed,
  size,
  color,
  phase,
}: {
  radius: number
  speed: number
  size: number
  color: string
  phase: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed + phase
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 0.7) * 0.35,
      Math.sin(t) * radius,
    )
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  )
}

function Week2Scene() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f0abfc" emissive="#7e22ce" emissiveIntensity={0.4} />
      </mesh>
      <OrbitingNode radius={2.2} speed={0.7} size={0.28} color="#7c9cff" phase={0} />
      <OrbitingNode radius={3.1} speed={0.45} size={0.22} color="#67e8f9" phase={1.2} />
      <OrbitingNode radius={4} speed={0.32} size={0.34} color="#86efac" phase={2.4} />
      <OrbitingNode radius={4.8} speed={0.22} size={0.18} color="#fcd34d" phase={3.1} />
    </>
  )
}

function Week3Scene() {
  return (
    <>
      <Sparkles
        count={180}
        scale={8}
        size={4}
        speed={0.6}
        color="#67e8f9"
        opacity={0.9}
      />
      <Sparkles
        count={80}
        scale={5}
        size={6}
        speed={0.3}
        color="#c4b5fd"
        opacity={0.7}
      />
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#0ea5e9"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>
    </>
  )
}

function NetworkGraph({
  count,
  radius,
  nodeColor,
}: {
  count: number
  radius: number
  nodeColor: string
}) {
  const nodes = useMemo(() => fibonacciSphere(count, radius), [count, radius])
  const edges = useMemo(() => {
    const links: Array<[number, number]> = []
    for (let i = 0; i < count; i++) {
      links.push([i, (i + 2) % count])
      if (i % 3 === 0) links.push([i, (i + 5) % count])
    }
    return links
  }, [count])

  return (
    <group>
      {nodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[nodes[a], nodes[b]]}
          color="#52525b"
          lineWidth={1.2}
        />
      ))}
    </group>
  )
}

function Week4Scene() {
  return <NetworkGraph count={22} radius={2.6} nodeColor="#86efac" />
}

function Cluster({
  center,
  color,
  count,
}: {
  center: [number, number, number]
  color: string
  count: number
}) {
  const offsets = useMemo(
    () => fibonacciSphere(count, 0.95).map(([x, y, z]) => [x * 0.85, y * 0.85, z * 0.85]),
    [count],
  )
  return (
    <group position={center}>
      {offsets.map((offset, index) => (
        <mesh key={index} position={offset as [number, number, number]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Week5Scene() {
  return (
    <>
      <Cluster center={[-2.4, 0.2, 0]} color="#fcd34d" count={10} />
      <Cluster center={[2.2, 0.6, -0.4]} color="#7c9cff" count={10} />
      <Cluster center={[0.1, -1.8, 0.6]} color="#fda4af" count={10} />
      <Line points={[[-2.4, 0.2, 0], [2.2, 0.6, -0.4]]} color="#71717a" lineWidth={1} />
      <Line points={[[2.2, 0.6, -0.4], [0.1, -1.8, 0.6]]} color="#71717a" lineWidth={1} />
      <Line points={[[0.1, -1.8, 0.6], [-2.4, 0.2, 0]]} color="#71717a" lineWidth={1} />
    </>
  )
}

function WaveMesh() {
  const mesh = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const geometry = mesh.current?.geometry
    if (!geometry) return
    const position = geometry.attributes.position
    const t = clock.getElapsedTime()
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const y = position.getY(i)
      position.setZ(
        i,
        Math.sin(x * 1.35 + t) * 0.38 + Math.cos(y * 1.15 + t * 0.85) * 0.28,
      )
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2.35, 0, 0]}>
      <planeGeometry args={[9, 9, 42, 42]} />
      <meshStandardMaterial color="#5eead4" wireframe transparent opacity={0.85} />
    </mesh>
  )
}

function Week6Scene() {
  return <WaveMesh />
}

function PickableNode({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  useCursor(hovered)

  return (
    <mesh
      position={position}
      scale={active ? 1.55 : hovered ? 1.28 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive((value) => !value)}
    >
      <sphereGeometry args={[0.28, 20, 20]} />
      <meshStandardMaterial
        color={active ? "#fbbf24" : color}
        emissive={active ? "#f59e0b" : color}
        emissiveIntensity={active ? 0.55 : hovered ? 0.35 : 0.15}
      />
    </mesh>
  )
}

function Week7Scene() {
  const nodes = useMemo(() => fibonacciSphere(14, 2.4), [])
  const edges = useMemo(() => {
    return nodes.map((_, i) => [i, (i + 1) % nodes.length] as [number, number])
  }, [nodes])

  return (
    <>
      {nodes.map((position, index) => (
        <PickableNode
          key={index}
          position={position}
          color={index % 2 === 0 ? "#fda4af" : "#7c9cff"}
        />
      ))}
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[nodes[a], nodes[b]]}
          color="#3f3f46"
          lineWidth={1}
        />
      ))}
    </>
  )
}

function Week8Scene() {
  return (
    <>
      <Stars radius={40} depth={30} count={1200} factor={3} saturation={0} fade speed={0.6} />
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={0.7} />
      </mesh>
      <NetworkGraph count={36} radius={3.4} nodeColor="#c4b5fd" />
      <Sparkles count={60} scale={10} size={3} speed={0.4} color="#e0e7ff" />
    </>
  )
}

export type WeekSceneConfig = {
  Scene: ComponentType
  cameraPosition: [number, number, number]
  autoRotate?: boolean
}

export const weekScenes: Record<number, WeekSceneConfig> = {
  1: { Scene: Week1Scene, cameraPosition: [0, 1.2, 6] },
  2: { Scene: Week2Scene, cameraPosition: [0, 2.4, 9] },
  3: { Scene: Week3Scene, cameraPosition: [0, 0, 7] },
  4: { Scene: Week4Scene, cameraPosition: [0, 0.8, 8] },
  5: { Scene: Week5Scene, cameraPosition: [0, 1.5, 10] },
  6: { Scene: Week6Scene, cameraPosition: [0, 3.2, 8], autoRotate: false },
  7: { Scene: Week7Scene, cameraPosition: [0, 0.5, 8], autoRotate: false },
  8: { Scene: Week8Scene, cameraPosition: [0, 1.2, 11] },
}
