import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Dices, Network, RotateCcw, Shuffle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { week1Graph } from "@/data/marvel-graph"
import {
  averageClustering,
  barabasiAlbert,
  ccdf,
  degreePreservingShuffle,
  deviation,
  erdosRenyi,
  mean,
  measureGraph,
  undirectedMarvel,
  wattsStrogatz,
  type ModelMetrics,
  type SimpleGraph,
} from "@/lib/week2-analysis"

const COLORS = ["#f4f4f5", "#60a5fa", "#c084fc", "#fb923c"]
const SHUFFLE_CACHE: number[] = []

function NetworkPreview({ graph, modelIndex }: { graph: SimpleGraph; modelIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(bounds.width * ratio)
      canvas.height = Math.round(bounds.height * ratio)
      const context = canvas.getContext("2d")
      if (!context) return
      context.scale(ratio, ratio)
      context.clearRect(0, 0, bounds.width, bounds.height)

      const degrees = Array.from({ length: graph.nodes }, () => 0)
      for (const [a, b] of graph.edges) {
        degrees[a] = (degrees[a] ?? 0) + 1
        degrees[b] = (degrees[b] ?? 0) + 1
      }
      const ranked = degrees
        .map((degree, node) => ({ degree, node }))
        .sort((a, b) => b.degree - a.degree || a.node - b.node)
      const rankByNode = new Map(ranked.map((item, rank) => [item.node, rank]))
      const radius = Math.min(bounds.width, bounds.height) * 0.43
      const centerX = bounds.width / 2
      const centerY = bounds.height / 2
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      const positions = Array.from({ length: graph.nodes }, (_, node) => {
        if (modelIndex === 2) {
          const angle = (node / graph.nodes) * Math.PI * 2 - Math.PI / 2
          return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius] as const
        }
        const rank = rankByNode.get(node) ?? node
        const angle = rank * goldenAngle
        const distance = radius * Math.sqrt((rank + 3) / (graph.nodes + 3))
        return [centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance] as const
      })

      context.lineWidth = 0.55
      context.strokeStyle = "rgba(113, 113, 122, 0.19)"
      context.beginPath()
      for (const [a, b] of graph.edges) {
        const source = positions[a]
        const target = positions[b]
        if (!source || !target) continue
        context.moveTo(source[0], source[1])
        context.lineTo(target[0], target[1])
      }
      context.stroke()

      const maxDegree = Math.max(...degrees)
      for (let node = 0; node < graph.nodes; node++) {
        const position = positions[node]
        if (!position) continue
        const importance = Math.sqrt((degrees[node] ?? 0) / maxDegree)
        context.beginPath()
        context.arc(position[0], position[1], 1.25 + importance * 4.25, 0, Math.PI * 2)
        context.fillStyle = `rgba(${96 + Math.round(importance * 96)}, ${165 - Math.round(importance * 33)}, 250, ${0.5 + importance * 0.5})`
        context.fill()
      }
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [graph, modelIndex])

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black/25">
      <canvas ref={canvasRef} className="h-[340px] w-full sm:h-[430px]" aria-label={`Two-dimensional view of the ${graph.name} network`} />
      <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-[10px] tracking-[0.14em] text-zinc-400 uppercase backdrop-blur">2D structure · node size = degree</div>
      <div className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-zinc-600">{modelIndex === 2 ? "ring coordinates" : "degree-ranked radial coordinates"}</div>
    </div>
  )
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border bg-background/45 p-3">
      <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-xl font-medium tabular-nums">{value}</p>
      {note ? <p className="mt-1 text-[11px] text-muted-foreground">{note}</p> : null}
    </div>
  )
}

function ParameterSlider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  onCommit,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  onCommit?: (value: number) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[11rem_1fr_4rem] sm:items-center">
      <span className="text-xs text-zinc-400">{label}</span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next ?? value)}
        onValueCommit={([next]) => onCommit?.(next ?? value)}
        aria-label={label}
      />
      <span className="rounded-md bg-zinc-800 px-2 py-1 text-center text-xs tabular-nums text-zinc-200">{display}</span>
    </div>
  )
}

function CcdfPlot({ real, comparison }: { real: ModelMetrics; comparison: ModelMetrics }) {
  const width = 620
  const height = 280
  const pad = { left: 54, right: 20, top: 22, bottom: 40 }
  const series = [
    { label: "Marvel", color: COLORS[0], points: ccdf(real.degrees) },
    { label: comparison.name, color: COLORS[1], points: ccdf(comparison.degrees) },
  ]
  const maxK = Math.max(...series.flatMap((item) => item.points.map((point) => point.k)))
  const x = (k: number) => pad.left + (Math.log10(k) / Math.log10(maxK)) * (width - pad.left - pad.right)
  const y = (p: number) => pad.top + ((-Math.log10(p)) / 3) * (height - pad.top - pad.bottom)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Log-log complementary cumulative degree distribution">
        <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} className="stroke-border" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} className="stroke-border" />
        {[1, 10, 100].filter((tick) => tick <= maxK).map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={pad.top} x2={x(tick)} y2={height - pad.bottom} className="stroke-border/40" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">{tick}</text>
          </g>
        ))}
        {[1, 0.1, 0.01, 0.001].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} y1={y(tick)} x2={width - pad.right} y2={y(tick)} className="stroke-border/40" />
            <text x={pad.left - 8} y={y(tick) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">{tick}</text>
          </g>
        ))}
        {series.map((item) => (
          <polyline
            key={item.label}
            points={item.points.map((point) => `${x(point.k)},${y(point.p)}`).join(" ")}
            fill="none"
            stroke={item.color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}
        <text x={(pad.left + width - pad.right) / 2} y={height - 3} textAnchor="middle" className="fill-muted-foreground text-[11px]">degree k (log)</text>
        <text x="13" y={height / 2} textAnchor="middle" transform={`rotate(-90 13 ${height / 2})`} className="fill-muted-foreground text-[11px]">P(K ≥ k) (log)</text>
      </svg>
    </div>
  )
}

function NullHistogram({ values, real }: { values: number[]; real: number }) {
  const width = 620
  const height = 230
  const pad = { left: 42, right: 20, top: 22, bottom: 35 }
  const minimum = Math.min(...values) * 0.96
  const maximum = Math.max(real, ...values) * 1.04
  const bins = Math.min(28, Math.max(6, Math.round(Math.sqrt(values.length) * 1.5)))
  const counts = Array.from({ length: bins }, () => 0)
  for (const value of values) {
    const index = Math.min(bins - 1, Math.floor(((value - minimum) / (maximum - minimum)) * bins))
    counts[index] = (counts[index] ?? 0) + 1
  }
  const maxCount = Math.max(...counts)
  const x = (value: number) => pad.left + ((value - minimum) / (maximum - minimum)) * (width - pad.left - pad.right)
  const plotWidth = width - pad.left - pad.right

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Null distribution of average clustering coefficients">
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} className="stroke-border" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} className="stroke-border" />
      {[0, Math.ceil(maxCount / 2), maxCount].filter((tick, index, ticks) => ticks.indexOf(tick) === index).map((tick) => {
        const tickY = height - pad.bottom - (tick / maxCount) * (height - pad.top - pad.bottom)
        return (
          <g key={tick}>
            <line x1={pad.left - 4} y1={tickY} x2={width - pad.right} y2={tickY} className="stroke-border/40" />
            <text x={pad.left - 8} y={tickY + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">{tick}</text>
          </g>
        )
      })}
      {counts.map((count, index) => {
        const barWidth = plotWidth / bins
        const barHeight = (count / maxCount) * (height - pad.top - pad.bottom)
        return <rect key={index} x={pad.left + index * barWidth + 1} y={height - pad.bottom - barHeight} width={barWidth - 2} height={barHeight} rx="2" fill="#60a5fa" opacity="0.72" />
      })}
      <line x1={x(real)} y1={pad.top} x2={x(real)} y2={height - pad.bottom} stroke="#fb923c" strokeWidth="3" />
      <text x={x(real) - 5} y={pad.top + 2} textAnchor="end" fill="#fb923c" className="text-[10px]">real Marvel</text>
      <text x={pad.left} y={height - 12} className="fill-muted-foreground text-[10px]">{minimum.toFixed(2)}</text>
      <text x={width - pad.right} y={height - 12} textAnchor="end" className="fill-muted-foreground text-[10px]">{maximum.toFixed(2)}</text>
      <text x={width / 2} y={height - 2} textAnchor="middle" className="fill-muted-foreground text-[10px]">average clustering C</text>
      <text x="12" y={height / 2} textAnchor="middle" transform={`rotate(-90 12 ${height / 2})`} className="fill-muted-foreground text-[10px]">shuffle count</text>
    </svg>
  )
}

export function Week2() {
  const [erMeanDegree, setErMeanDegree] = useState(9.47)
  const [wsNeighbors, setWsNeighbors] = useState(10)
  const [wsRewiring, setWsRewiring] = useState(0.2)
  const [baLinks, setBaLinks] = useState(5)
  const [shuffleCount, setShuffleCount] = useState(100)
  const [shuffleSlider, setShuffleSlider] = useState(100)
  const base = useMemo(() => {
    const marvelGraph = undirectedMarvel(week1Graph)
    const real = measureGraph(marvelGraph)
    return { marvelGraph, real }
  }, [])
  const shuffles = useMemo(
    () => {
      while (SHUFFLE_CACHE.length < shuffleCount) {
        const index = SHUFFLE_CACHE.length
        SHUFFLE_CACHE.push(
          averageClustering(
            degreePreservingShuffle(
              base.marvelGraph,
              base.marvelGraph.edges.length * 10,
              4000 + index,
            ),
          ),
        )
      }
      return SHUFFLE_CACHE.slice(0, shuffleCount)
    },
    [base.marvelGraph, shuffleCount],
  )
  const analysis = useMemo(() => {
    const erEdges = Math.round((base.marvelGraph.nodes * erMeanDegree) / 2)
    const graphs = [
      base.marvelGraph,
      erdosRenyi(base.marvelGraph.nodes, erEdges),
      wattsStrogatz(base.marvelGraph.nodes, wsNeighbors, wsRewiring),
      barabasiAlbert(base.marvelGraph.nodes, baLinks),
    ]
    const metrics = [base.real, ...graphs.slice(1).map(measureGraph)]
    return { graphs, metrics }
  }, [baLinks, base, erMeanDegree, wsNeighbors, wsRewiring])
  const [selected, setSelected] = useState(1)
  const real = analysis.metrics[0]!
  const comparison = analysis.metrics[selected]!
  const nullMean = mean(shuffles)
  const nullDeviation = deviation(shuffles)
  const zScore = (real.clustering - nullMean) / nullDeviation
  const empiricalP =
    (1 + shuffles.filter((value) => value >= real.clustering).length) /
    (shuffles.length + 1)

  return (
    <div className="min-h-svh bg-[#09090b] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(96,165,250,0.12),transparent_35%),radial-gradient(circle_at_15%_55%,rgba(192,132,252,0.08),transparent_30%)]" />
      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav className="mb-16 flex items-center justify-between">
          <Button variant="outline" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
          <Badge variant="outline">02805 · Week 2</Badge>
        </nav>

        <header className="mb-16 max-w-4xl">
          <p className="mb-4 text-xs tracking-[0.22em] text-blue-400 uppercase">Models & null models</p>
          <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.055em] sm:text-7xl">Compared to what?</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">A number is not interesting on its own. We put the Marvel network beside three famous models, then shuffle it without changing a single degree to ask what structure remains surprising.</p>
        </header>

        <section className="mb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-xs text-blue-400">01</p><h2 className="mt-1 text-2xl font-medium">One network, three hypotheses</h2></div>
            <p className="hidden max-w-md text-right text-sm text-zinc-500 sm:block">All results use a fixed seed. Marvel is converted from 1,784 directed hyperlinks to 1,434 unique undirected edges.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysis.metrics.map((model, index) => (
              <button key={model.name} type="button" onClick={() => setSelected(index)} className={`rounded-xl border p-4 text-left transition ${selected === index ? "border-blue-400 bg-blue-400/10" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"}`}>
                <span className="text-xs text-zinc-500">0{index + 1}</span>
                <p className="mt-5 font-medium">{model.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{index === 0 ? "Observed" : index === 1 ? "Chance" : index === 2 ? "Shortcuts" : "Growth + preference"}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium">Experiment controls</p>
                <p className="mt-1 text-[11px] text-zinc-500">Move a slider and both views recalculate from the same network.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setErMeanDegree(9.47)
                  setWsNeighbors(10)
                  setWsRewiring(0.2)
                  setBaLinks(5)
                }}
              >
                <RotateCcw />Reset
              </Button>
            </div>
            {selected === 0 ? (
              <p className="text-sm text-zinc-400">Marvel is the observed network. Select a model above to change its assumptions.</p>
            ) : null}
            {selected === 1 ? (
              <ParameterSlider label="Expected mean degree ⟨k⟩" value={erMeanDegree} display={erMeanDegree.toFixed(1)} min={1} max={20} step={0.25} onChange={setErMeanDegree} />
            ) : null}
            {selected === 2 ? (
              <div className="space-y-4">
                <ParameterSlider label="Rewiring probability q" value={wsRewiring} display={wsRewiring.toFixed(2)} min={0} max={1} step={0.01} onChange={setWsRewiring} />
                <ParameterSlider label="Neighbors k" value={wsNeighbors} display={String(wsNeighbors)} min={2} max={20} step={2} onChange={setWsNeighbors} />
              </div>
            ) : null}
            {selected === 3 ? (
              <ParameterSlider label="Links per newcomer m" value={baLinks} display={String(baLinks)} min={1} max={12} step={1} onChange={setBaLinks} />
            ) : null}
          </div>

          <Card className="mt-4 border-zinc-800 bg-zinc-900/70">
            <CardHeader><CardTitle>{comparison.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Metric label="nodes" value={String(comparison.n)} />
                <Metric label="edges" value={String(comparison.m)} />
                <Metric label="mean degree" value={comparison.meanDegree.toFixed(2)} />
                <Metric label="clustering" value={comparison.clustering.toFixed(3)} />
                <Metric label="mean path" value={comparison.meanDistance.toFixed(2)} note="connected pairs" />
                <Metric label="largest hub" value={String(comparison.maxDegree)} />
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <NetworkPreview graph={analysis.graphs[selected] ?? analysis.graphs[0]!} modelIndex={selected} />
                <CcdfPlot real={real} comparison={comparison} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs text-purple-400">02</p>
            <h2 className="mt-1 text-3xl font-medium tracking-tight">Every model fails differently.</h2>
            <div className="mt-7 space-y-5 text-sm leading-relaxed text-zinc-400">
              <p><strong className="text-zinc-100">Random graphs</strong> get Marvel’s short paths approximately right, but their degree distribution dies early. Chance does not make a Spider-Man.</p>
              <p><strong className="text-zinc-100">Watts–Strogatz</strong> combines clustering with short paths. A few rewired links act as shortcuts, but its degrees remain too homogeneous.</p>
              <p><strong className="text-zinc-100">Barabási–Albert</strong> produces the missing hubs through growth and preferential attachment. A heavy tail alone, however, does not reproduce Marvel’s full social structure.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Marvel C" value={real.clustering.toFixed(3)} note="many closed neighborhoods" />
            <Metric label="Marvel distance" value={real.meanDistance.toFixed(2)} note={`diameter ${real.diameter}`} />
            <Metric label="Marvel isolates" value={String(real.isolates)} note="lost in global averages" />
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-5"><p className="text-xs text-orange-400">03</p><h2 className="mt-1 text-3xl font-medium tracking-tight">Shuffle away who connects to whom.</h2></div>
          <Card className="border-zinc-800 bg-zinc-900/70">
            <CardContent className="pt-1">
              <div className="mb-7 rounded-lg border border-zinc-800 bg-black/20 p-4">
                <ParameterSlider
                  label="Number of random shuffles"
                  value={shuffleSlider}
                  display={String(shuffleSlider)}
                  min={10}
                  max={200}
                  step={10}
                  onChange={setShuffleSlider}
                  onCommit={setShuffleCount}
                />
              </div>
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
                <NullHistogram values={shuffles} real={real.clustering} />
                <div>
                  <div className="flex items-center gap-2 text-sm"><Shuffle className="size-4 text-orange-400" />{shuffleCount} degree-preserving shuffles</div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Metric label="null mean" value={nullMean.toFixed(3)} />
                    <Metric label="null σ" value={nullDeviation.toFixed(3)} />
                    <Metric label="z-score" value={zScore.toFixed(1)} />
                    <Metric label="empirical p" value={empiricalP.toFixed(3)} />
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-zinc-400">Each shuffle preserves every character’s degree but randomizes who connects to whom. Marvel’s clustering remains far outside the null distribution, so the degree sequence alone cannot explain all of its triangles.</p>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500">More shuffles make the null distribution smoother and allow a smaller empirical p-value. With {shuffleCount} shuffles, the smallest reportable value is {(1 / (shuffleCount + 1)).toFixed(4)}.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: Dices, title: "ER asks", text: "What follows from only n and m? Short paths do; Marvel-sized hubs and dense neighborhoods do not." },
            { icon: Network, title: "BA asks", text: "Can growth and popularity create the tail? Yes—but matching degrees is not the same as matching structure." },
            { icon: Shuffle, title: "The null asks", text: "What survives after degree is held fixed? The remaining gap is evidence about who connects to whom." },
          ].map((item) => (
            <Card key={item.title} className="border-zinc-800 bg-zinc-900/50">
              <CardContent><item.icon className="mb-8 size-5 text-blue-400" /><h3 className="font-medium">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p></CardContent>
            </Card>
          ))}
        </section>

        <footer className="flex flex-col justify-between gap-5 border-t border-zinc-800 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center">
          <p>Week 2 conclusion: the baseline determines the claim.</p>
          <Button variant="outline" asChild><Link to="/week1">Return to the network<ArrowRight /></Link></Button>
        </footer>
      </main>
    </div>
  )
}
