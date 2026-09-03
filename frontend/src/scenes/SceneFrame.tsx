import { useRef, type ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { cn } from "@/lib/utils"

type SceneFrameProps = {
  children: ReactNode
  className?: string
  cameraPosition?: [number, number, number]
  cameraFar?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  enableControls?: boolean
  minDistance?: number
  maxDistance?: number
}

function MultiAxisOrbit({
  autoRotate,
  autoRotateSpeed,
  minDistance,
  maxDistance,
}: {
  autoRotate: boolean
  autoRotateSpeed: number
  minDistance: number
  maxDistance: number
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const dragging = useRef(false)
  const polarDir = useRef(1)

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !autoRotate || dragging.current) return

    const yaw = ((Math.PI * 2 * autoRotateSpeed) / 60) * delta
    controls.setAzimuthalAngle(controls.getAzimuthalAngle() + yaw)

    const minPolar = 0.45
    const maxPolar = Math.PI - 0.45
    const pitch = ((Math.PI * 2 * autoRotateSpeed * 0.4) / 60) * delta
    let polar = controls.getPolarAngle() + polarDir.current * pitch
    if (polar >= maxPolar) {
      polar = maxPolar
      polarDir.current = -1
    } else if (polar <= minPolar) {
      polar = minPolar
      polarDir.current = 1
    }
    controls.setPolarAngle(polar)
    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      minDistance={minDistance}
      maxDistance={maxDistance}
      onStart={() => {
        dragging.current = true
      }}
      onEnd={() => {
        dragging.current = false
      }}
    />
  )
}

export function SceneFrame({
  children,
  className,
  cameraPosition = [0, 1.6, 8],
  cameraFar = 1000,
  autoRotate = true,
  autoRotateSpeed = 0.55,
  enableControls = true,
  minDistance = 3,
  maxDistance = 18,
}: SceneFrameProps) {
  return (
    <div className={cn("absolute inset-0", className)}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50, far: cameraFar }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#09090b"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 8, 4]} intensity={1.15} />
        <pointLight position={[-6, -2, -4]} intensity={0.5} color="#7c9cff" />
        {children}
        {enableControls ? (
          <MultiAxisOrbit
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={minDistance}
            maxDistance={maxDistance}
          />
        ) : null}
      </Canvas>
    </div>
  )
}
