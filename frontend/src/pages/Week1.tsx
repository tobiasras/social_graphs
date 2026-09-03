import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronDown, Move, Rotate3d, ZoomIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { NetworkFingerprint } from "@/components/NetworkFingerprint"
import { week1MaxDegree } from "@/data/marvel-graph"
import { SceneFrame } from "@/scenes/SceneFrame"
import { MarvelForceGraph } from "@/scenes/MarvelForceGraph"

function OrbitHint({
  autoRotate,
  onToggle,
}: {
  autoRotate: boolean
  onToggle: () => void
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-card/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
      <span className="flex items-center gap-1.5">
        <Rotate3d className="size-3.5 text-foreground" />
        Drag to orbit
      </span>
      <span className="h-3 w-px bg-border" />
      <span className="flex items-center gap-1.5">
        <ZoomIn className="size-3.5 text-foreground" />
        Scroll to zoom
      </span>
      <span className="h-3 w-px bg-border" />
      <span className="flex items-center gap-1.5">
        <Move className="size-3.5 text-foreground" />
        Right-drag to pan
      </span>
      <span className="h-3 w-px bg-border" />
      <Button
        type="button"
        size="xs"
        variant={autoRotate ? "default" : "outline"}
        aria-pressed={autoRotate}
        aria-label={
          autoRotate ? "Stop auto-rotate" : "Start auto-rotate"
        }
        onClick={onToggle}
      >
        {autoRotate ? "Stop auto-rotate" : "Auto-rotate"}
      </Button>
    </div>
  )
}

export function Week1() {
  const [minDegree, setMinDegree] = useState(0)
  const [invertDegree, setInvertDegree] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const cutoff = invertDegree ? week1MaxDegree - minDegree : minDegree

  return (
    <div className="relative h-svh overflow-hidden">
      <SceneFrame
        autoRotate={autoRotate}
        autoRotateSpeed={2.50}
        cameraPosition={[0, 80, 1800]}
        cameraFar={12000}
        minDistance={40}
        maxDistance={2400}
      >
        <MarvelForceGraph
          minDegree={minDegree}
          invertDegree={invertDegree}
        />
      </SceneFrame>

      <div className="pointer-events-none absolute inset-0 z-10 p-4">
        <div className="absolute top-4 left-4 flex w-72 max-h-[calc(100svh-7rem)] flex-col items-start gap-3">
          <Button variant="outline" className="pointer-events-auto" asChild>
            <Link to="/">
              <ArrowLeft />
              Week 1
            </Link>
          </Button>
          <div className="pointer-events-auto min-h-0 w-full min-w-0 overflow-y-auto rounded-xl border bg-card/80 px-3 py-2.5 backdrop-blur-md">
            <h1 className="font-heading text-lg tracking-tight">
              Marvel Universe Graph
            </h1>
            <div className="mt-2.5 flex flex-wrap gap-1">
              <Badge variant="outline">Tobias Juul Rasmussen</Badge>
              <Badge variant="outline">Mathias Bang</Badge>
              <Badge variant="outline">Nicolai Stenstrøm</Badge>
            </div>
            <details open className="group mt-2.5 min-w-0">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] text-muted-foreground select-none [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-3.5 shrink-0 transition-transform group-open:rotate-180" />
                What this is
              </summary>
              <div className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                <p>A 3D explorer of Marvel characters as a graph using force-directed layout. Filter the graph by degree and inspect the degree distribution.</p>
                <ul className="space-y-1.5">
                  <li>
                    <span className="font-medium text-foreground">Nodes.</span>{" "}
                    Wikipedia pages for characters.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Links.</span>{" "}
                    Hyperlinks from one page to another.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Size & color.
                    </span>{" "}
                    How many connections a character has (without the filter)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Hover.</span>{" "}
                    Inspect a node and open its Wikipedia page.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Slider.</span>{" "}
                    Hide sparsely linked characters, or invert to hide hubs.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Chart.</span>{" "}
                    Degree distribution of whatever is still visible.
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>

        <div className="pointer-events-auto absolute top-4 left-1/2 w-full max-w-md -translate-x-1/2 rounded-xl border bg-card/80 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">
              Hide degree {invertDegree ? ">" : "<"}
            </span>
            <Slider
              min={0}
              max={week1MaxDegree}
              step={1}
              value={[minDegree]}
              onValueChange={([value]) => setMinDegree(value ?? 0)}
              aria-label={
                invertDegree ? "Maximum node degree" : "Minimum node degree"
              }
            />
            <Badge variant="secondary" className="min-w-8 justify-center">
              {cutoff}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant={invertDegree ? "default" : "outline"}
              aria-pressed={invertDegree}
              aria-label="Hide high-degree hubs instead"
              onClick={() => setInvertDegree((current) => !current)}
            >
              Flip
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] leading-none text-muted-foreground">
            {invertDegree
              ? "Hides nodes with more links than this."
              : "Hides nodes with fewer links than this."}
          </p>
        </div>

        <div className="absolute bottom-4 left-4">
          <OrbitHint
            autoRotate={autoRotate}
            onToggle={() => setAutoRotate((current) => !current)}
          />
        </div>

        <div className="absolute right-4 bottom-4">
          <NetworkFingerprint
            minDegree={minDegree}
            invertDegree={invertDegree}
          />
        </div>
      </div>
    </div>
  )
}
