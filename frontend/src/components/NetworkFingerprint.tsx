import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  inducedDegrees,
  inducedStats,
  visibleNodeIds,
  week1Graph,
} from "@/data/marvel-graph"
import {
  exactDistribution,
  forLogLog,
  groupedDistribution,
  scaleValue,
  type DistPoint,
} from "@/lib/degree-distribution"

type Binning = "exact" | "grouped"
type Scale = "linear" | "loglog"
type Direction = "in" | "out"

const WIDTH = 220
const HEIGHT = 140
const PAD = { top: 12, right: 10, bottom: 24, left: 36 }

function ToggleGroup<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T
  options: readonly T[]
  labels: Record<T, string>
  onChange: (value: T) => void
}) {
  return (
    <div className="flex rounded-lg border bg-background/40 p-0.5">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          size="xs"
          variant={value === option ? "default" : "ghost"}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </Button>
      ))}
    </div>
  )
}

function plotBounds(points: DistPoint[], logScale: boolean) {
  if (points.length === 0) {
    return { xMin: 1, xMax: 10, yMin: 0.001, yMax: 1 }
  }
  const xs = points.map((point) => point.k)
  const ys = points.map((point) => point.p)
  let xMin = Math.min(...xs)
  let xMax = Math.max(...xs)
  let yMin = Math.min(...ys)
  let yMax = Math.max(...ys)
  if (logScale) {
    const posX = xs.filter((value) => value > 0)
    const posY = ys.filter((value) => value > 0)
    xMin = posX.length ? Math.min(...posX) : 1
    yMin = posY.length ? Math.min(...posY) : yMax
  }
  if (xMin === xMax) xMax = xMin + 1
  if (yMin === yMax) yMax = yMin * 2 || 1
  return { xMin, xMax, yMin, yMax }
}

function toSvg(points: DistPoint[], logScale: boolean) {
  if (points.length === 0) return []
  const { xMin, xMax, yMin, yMax } = plotBounds(points, logScale)
  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  return points.map((point) => ({
    ...point,
    x: PAD.left + scaleValue(point.k, xMin, xMax, logScale) * innerW,
    y: PAD.top + (1 - scaleValue(point.p, yMin, yMax, logScale)) * innerH,
  }))
}

function axisLabel(value: number, logScale: boolean) {
  if (logScale) {
    const exp = Math.log10(value)
    if (Math.abs(exp - Math.round(exp)) < 0.05) return `10^${Math.round(exp)}`
  }
  if (value >= 100) return value.toFixed(0)
  if (value >= 10) return value.toFixed(1)
  if (value >= 1) return value.toFixed(2)
  return value.toPrecision(2)
}

function DegreePlot({
  title,
  points,
  logScale,
  color,
}: {
  title: string
  points: DistPoint[]
  logScale: boolean
  color: string
}) {
  const plotted = useMemo(
    () => toSvg(logScale ? forLogLog(points) : points, logScale),
    [logScale, points],
  )
  const bounds = plotBounds(
    logScale ? forLogLog(points) : points,
    logScale,
  )

  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium">{title}</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-36 w-full overflow-visible"
        role="img"
        aria-label={`${title} degree distribution`}
      >
        <line
          x1={PAD.left}
          y1={HEIGHT - PAD.bottom}
          x2={WIDTH - PAD.right}
          y2={HEIGHT - PAD.bottom}
          className="stroke-border"
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={HEIGHT - PAD.bottom}
          className="stroke-border"
        />
        <text
          x={(PAD.left + WIDTH - PAD.right) / 2}
          y={HEIGHT - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          k
        </text>
        <text
          x={12}
          y={(PAD.top + HEIGHT - PAD.bottom) / 2}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
          transform={`rotate(-90 12 ${(PAD.top + HEIGHT - PAD.bottom) / 2})`}
        >
          P(k)
        </text>
        {plotted.length > 1
          ? plotted.map((point, index) => {
              const next = plotted[index + 1]
              if (!next) return null
              return (
                <line
                  key={`l-${point.k}-${next.k}`}
                  x1={point.x}
                  y1={point.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={color}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              )
            })
          : null}
        {plotted.map((point) => (
          <circle
            key={point.k}
            cx={point.x}
            cy={point.y}
            r={2.4}
            fill={color}
          >
            <title>
              k={point.k.toPrecision(3)}, P={point.p.toPrecision(3)}
            </title>
          </circle>
        ))}
        <text
          x={PAD.left}
          y={HEIGHT - PAD.bottom + 12}
          className="fill-muted-foreground text-[8px]"
        >
          {axisLabel(bounds.xMin, logScale)}
        </text>
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - PAD.bottom + 12}
          textAnchor="end"
          className="fill-muted-foreground text-[8px]"
        >
          {axisLabel(bounds.xMax, logScale)}
        </text>
      </svg>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function NetworkFingerprint({
  minDegree,
  invertDegree,
}: {
  minDegree: number
  invertDegree: boolean
}) {
  const [direction, setDirection] = useState<Direction>("in")
  const [binning, setBinning] = useState<Binning>("grouped")
  const [scale, setScale] = useState<Scale>("loglog")
  const logScale = scale === "loglog"

  const active = useMemo(() => {
    const visible = visibleNodeIds(week1Graph, minDegree, invertDegree)
    return inducedDegrees(week1Graph, visible)
  }, [invertDegree, minDegree])
  const stats = useMemo(() => inducedStats(active), [active])

  const inDegrees = useMemo(
    () => active.map((node) => node.inDegree),
    [active],
  )
  const outDegrees = useMemo(
    () => active.map((node) => node.outDegree),
    [active],
  )
  const incoming = useMemo(
    () =>
      binning === "exact"
        ? exactDistribution(inDegrees)
        : groupedDistribution(inDegrees),
    [binning, inDegrees],
  )
  const outgoing = useMemo(
    () =>
      binning === "exact"
        ? exactDistribution(outDegrees)
        : groupedDistribution(outDegrees),
    [binning, outDegrees],
  )
  const incomingPlot = direction === "in"

  return (
    <div className="pointer-events-auto flex w-72 flex-col gap-3 rounded-xl border bg-card/80 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide uppercase">
          Network fingerprint
        </p>
        <ToggleGroup
          value={direction}
          options={["in", "out"] as const}
          labels={{ in: "In", out: "Out" }}
          onChange={setDirection}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ToggleGroup
          value={binning}
          options={["exact", "grouped"] as const}
          labels={{ exact: "Exact", grouped: "Binned" }}
          onChange={setBinning}
        />
        <ToggleGroup
          value={scale}
          options={["linear", "loglog"] as const}
          labels={{ linear: "Linear", loglog: "Log-log" }}
          onChange={setScale}
        />
      </div>
      <DegreePlot
        title={incomingPlot ? "Incoming" : "Outgoing"}
        points={incomingPlot ? incoming : outgoing}
        logScale={logScale}
        color={incomingPlot ? "#f87171" : "#60a5fa"}
      />
      <div className="grid grid-cols-1 gap-y-1">
        <Stat label="Nodes N" value={String(stats.n)} />
        <Stat label="Links L" value={String(stats.l)} />
        <Stat label="Density" value={stats.density.toFixed(4)} />
        <Stat label="Mean in" value={stats.meanIn.toFixed(2)} />
        <Stat label="Mean out" value={stats.meanOut.toFixed(2)} />
        <Stat label="Max in" value={String(stats.maxIn)} />
        <Stat label="Max out" value={String(stats.maxOut)} />
        <Stat label="Isolates" value={String(stats.isolates)} />
      </div>
    </div>
  )
}
