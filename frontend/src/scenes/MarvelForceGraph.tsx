import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { Group } from "three"
import R3fForceGraph from "r3f-forcegraph"
import type { GraphMethods, LinkObject, NodeObject } from "r3f-forcegraph"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  cloneMarvelGraph,
  inducedDegrees,
  isNodeInDegreeFilter,
  visibleNodeIds,
  week1Graph,
  week1MaxDegree,
  type MarvelNode,
} from "@/data/marvel-graph"

type MarvelForceGraphProps = {
  minDegree?: number
  invertDegree?: boolean
}

function nodeDegree(node: NodeObject<MarvelNode>) {
  const value = Number(node.val)
  return Number.isFinite(value) ? value : 0
}

function degreeColor(degree: number) {
  const t = week1MaxDegree <= 0 ? 0 : Math.sqrt(degree / week1MaxDegree)
  const hue = 220 * (1 - t)
  return `hsl(${hue}, 85%, 58%)`
}

function NodeInfoLabel({
  node,
  actualIn,
  actualOut,
  onPointerOverLabel,
}: {
  node: NodeObject<MarvelNode>
  actualIn: number
  actualOut: number
  onPointerOverLabel: (over: boolean) => void
}) {
  const group = useRef<Group>(null)

  useFrame(() => {
    if (!group.current) return
    const radius = Math.cbrt(Math.max(nodeDegree(node), 2)) * 3
    group.current.position.set(
      (node.x ?? 0) + radius + 2,
      node.y ?? 0,
      node.z ?? 0,
    )
  })

  return (
    <group ref={group}>
      <Html
        sprite
        zIndexRange={[30, 20]}
        style={{ pointerEvents: "auto", transform: "translate(8px, -50%)" }}
      >
        <Card
          size="sm"
          className="w-56 bg-card/90 shadow-lg backdrop-blur-md"
          onPointerEnter={() => onPointerOverLabel(true)}
          onPointerLeave={() => onPointerOverLabel(false)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <CardHeader>
            <p className="text-[11px] text-muted-foreground">
              Original (no filter): {nodeDegree(node)}
            </p>
            <p className="mb-1 text-[11px] text-muted-foreground">
              Filtered: {actualIn} in / {actualOut} out
            </p>
            <CardTitle className="text-sm">{String(node.name ?? node.id)}</CardTitle>
            <CardDescription className="line-clamp-3">
              {String(node.description ?? "")}
            </CardDescription>
          </CardHeader>
          {node.url ? (
            <CardFooter className="justify-end">
              <Button variant="ghost" size="sm" asChild>
                <a href={String(node.url)} target="_blank" rel="noreferrer">
                  Wikipedia
                  <ExternalLink />
                </a>
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </Html>
    </group>
  )
}

export function MarvelForceGraph({
  minDegree = 0,
  invertDegree = false,
}: MarvelForceGraphProps) {
  const fgRef = useRef<GraphMethods<MarvelNode> | undefined>(undefined)
  const forcesReady = useRef(false)
  const graphData = useMemo(() => cloneMarvelGraph(week1Graph), [])
  const [hovered, setHovered] = useState<NodeObject<MarvelNode> | null>(null)
  const overLabel = useRef(false)
  const visibleIds = useMemo(
    () => visibleNodeIds(week1Graph, minDegree, invertDegree),
    [invertDegree, minDegree],
  )
  const actualById = useMemo(
    () =>
      new Map(
        inducedDegrees(week1Graph, visibleIds).map((node) => [node.id, node]),
      ),
    [visibleIds],
  )

  const isVisible = useCallback(
    (node: NodeObject<MarvelNode>) =>
      isNodeInDegreeFilter(nodeDegree(node), minDegree, invertDegree),
    [invertDegree, minDegree],
  )

  const isLinkVisible = useCallback(
    (link: LinkObject<MarvelNode>) => {
      const sourceId =
        typeof link.source === "object" && link.source
          ? String(link.source.id)
          : String(link.source ?? "")
      const targetId =
        typeof link.target === "object" && link.target
          ? String(link.target.id)
          : String(link.target ?? "")
      return visibleIds.has(sourceId) && visibleIds.has(targetId)
    },
    [visibleIds],
  )

  useEffect(() => {
    setHovered((current) =>
      current && !isVisible(current) ? null : current,
    )
  }, [isVisible])

  const configureForces = useCallback(() => {
    const fg = fgRef.current
    if (!fg || forcesReady.current) return
    const charge = fg.d3Force("charge")
    if (!charge) return
    forcesReady.current = true
    charge.strength((node: NodeObject<MarvelNode>) =>
      nodeDegree(node) === 0 ? -35 : -140,
    )
    charge.distanceMax?.(900)
    const link = fg.d3Force("link")
    link?.distance?.(70)
    link?.strength?.(0.2)
    fg.d3ReheatSimulation()
  }, [])

  useFrame(() => {
    if (!forcesReady.current) configureForces()
    fgRef.current?.tickFrame()
  })

  const handleHover = useCallback(
    (node: NodeObject<MarvelNode> | null) => {
      if (!node && overLabel.current) return
      if (node && !isVisible(node)) {
        setHovered(null)
        return
      }
      setHovered(node)
    },
    [isVisible],
  )

  return (
    <>
      <R3fForceGraph
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeVal={(node) => Math.max(nodeDegree(node), 2)}
        nodeRelSize={3}
        nodeResolution={12}
        nodeColor={(node) => degreeColor(nodeDegree(node))}
        nodeOpacity={0.92}
        nodeVisibility={isVisible}
        linkVisibility={isLinkVisible}
        linkColor="#3f3f46"
        linkOpacity={0.1}
        warmupTicks={80}
        d3VelocityDecay={0.28}
        cooldownTime={12000}
        onFinishUpdate={configureForces}
        onNodeHover={handleHover}
      />
      {hovered ? (
        <NodeInfoLabel
          node={hovered}
          actualIn={actualById.get(String(hovered.id))?.inDegree ?? 0}
          actualOut={actualById.get(String(hovered.id))?.outDegree ?? 0}
          onPointerOverLabel={(over) => {
            overLabel.current = over
            if (!over) setHovered(null)
          }}
        />
      ) : null}
    </>
  )
}
