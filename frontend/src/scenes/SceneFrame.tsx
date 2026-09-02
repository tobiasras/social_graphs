import { type ReactNode } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

type SceneFrameProps = {
  children: ReactNode
  cameraPosition?: [number, number, number]
  autoRotate?: boolean
  enableControls?: boolean
}

export function SceneFrame({
  children,
  cameraPosition = [0, 1.6, 8],
  autoRotate = true,
  enableControls = true,
}: SceneFrameProps) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: cameraPosition, fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={["#09090b"]} />
        <fog attach="fog" args={["#09090b", 12, 28]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 8, 4]} intensity={1.15} />
        <pointLight position={[-6, -2, -4]} intensity={0.5} color="#7c9cff" />
        {children}
        {enableControls ? (
          <OrbitControls
            enableDamping
            autoRotate={autoRotate}
            autoRotateSpeed={0.55}
            minDistance={3}
            maxDistance={18}
          />
        ) : null}
      </Canvas>
    </div>
  )
}
