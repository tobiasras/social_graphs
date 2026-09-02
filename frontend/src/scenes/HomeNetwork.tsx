import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import type { Group } from "three"

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

export function HomeNetwork() {
  const group = useRef<Group>(null)
  const nodes = useMemo(() => fibonacciSphere(28, 3.4), [])
  const edges = useMemo(() => {
    const links: Array<[number, number]> = []
    for (let i = 0; i < nodes.length; i++) {
      links.push([i, (i + 3) % nodes.length])
      if (i % 4 === 0) links.push([i, (i + 7) % nodes.length])
    }
    return links
  }, [nodes.length])

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.08
    group.current.rotation.x += delta * 0.02
  })

  return (
    <group ref={group}>
      {nodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color={index % 5 === 0 ? "#c4b5fd" : "#7c9cff"}
            emissive="#7c9cff"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[nodes[a], nodes[b]]}
          color="#3f3f46"
          lineWidth={1}
        />
      ))}
    </group>
  )
}
