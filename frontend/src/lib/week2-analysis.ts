import type { MarvelGraph } from "@/data/marvel-graph"

export type SimpleGraph = {
  name: string
  nodes: number
  edges: Array<[number, number]>
}

export type ModelMetrics = {
  name: string
  n: number
  m: number
  meanDegree: number
  clustering: number
  meanDistance: number
  diameter: number
  isolates: number
  maxDegree: number
  degrees: number[]
}

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function edgeKey(a: number, b: number) {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

function uniqueEdges(edges: Array<[number, number]>) {
  const seen = new Set<string>()
  const result: Array<[number, number]> = []
  for (const [a, b] of edges) {
    if (a === b) continue
    const key = edgeKey(a, b)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(a < b ? [a, b] : [b, a])
  }
  return result
}

export function undirectedMarvel(graph: MarvelGraph): SimpleGraph {
  const index = new Map(graph.nodes.map((node, i) => [node.id, i]))
  const edges = graph.links.flatMap((link): Array<[number, number]> => {
    const source = index.get(String(link.source))
    const target = index.get(String(link.target))
    return source === undefined || target === undefined ? [] : [[source, target]]
  })
  return { name: "Marvel", nodes: graph.nodes.length, edges: uniqueEdges(edges) }
}

function adjacency(graph: SimpleGraph) {
  const neighbors = Array.from({ length: graph.nodes }, () => new Set<number>())
  for (const [a, b] of graph.edges) {
    neighbors[a]?.add(b)
    neighbors[b]?.add(a)
  }
  return neighbors
}

export function averageClustering(graph: SimpleGraph) {
  const neighbors = adjacency(graph)
  let clustering = 0
  for (let node = 0; node < graph.nodes; node++) {
    const local = [...(neighbors[node] ?? [])]
    if (local.length < 2) continue
    let links = 0
    for (let i = 0; i < local.length; i++) {
      for (let j = i + 1; j < local.length; j++) {
        if (neighbors[local[i] ?? 0]?.has(local[j] ?? 0)) links++
      }
    }
    clustering += (2 * links) / (local.length * (local.length - 1))
  }

  return graph.nodes ? clustering / graph.nodes : 0
}

export function measureGraph(graph: SimpleGraph): ModelMetrics {
  const neighbors = adjacency(graph)
  const degrees = neighbors.map((set) => set.size)
  const clustering = averageClustering(graph)
  const active = degrees
    .map((degree, node) => ({ degree, node }))
    .filter(({ degree }) => degree > 0)
    .map(({ node }) => node)
  let distanceSum = 0
  let pairCount = 0
  let diameter = 0
  for (const source of active) {
    const distances = new Int16Array(graph.nodes).fill(-1)
    const queue = [source]
    distances[source] = 0
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head]
      if (current === undefined) continue
      for (const next of neighbors[current] ?? []) {
        if (distances[next] !== -1) continue
        distances[next] = distances[current] + 1
        queue.push(next)
      }
    }
    for (let target = source + 1; target < graph.nodes; target++) {
      const distance = distances[target]
      if (distance <= 0) continue
      distanceSum += distance
      pairCount++
      diameter = Math.max(diameter, distance)
    }
  }

  return {
    name: graph.name,
    n: graph.nodes,
    m: graph.edges.length,
    meanDegree: graph.nodes ? (2 * graph.edges.length) / graph.nodes : 0,
    clustering,
    meanDistance: pairCount ? distanceSum / pairCount : 0,
    diameter,
    isolates: degrees.filter((degree) => degree === 0).length,
    maxDegree: Math.max(0, ...degrees),
    degrees,
  }
}

export function erdosRenyi(n: number, m: number, seed = 2026): SimpleGraph {
  const rng = random(seed)
  const selected = new Set<string>()
  const edges: Array<[number, number]> = []
  while (edges.length < m) {
    const a = Math.floor(rng() * n)
    const b = Math.floor(rng() * n)
    if (a === b) continue
    const key = edgeKey(a, b)
    if (selected.has(key)) continue
    selected.add(key)
    edges.push(a < b ? [a, b] : [b, a])
  }
  return { name: "Random G(n,m)", nodes: n, edges }
}

export function wattsStrogatz(
  n: number,
  k = 10,
  probability = 0.2,
  seed = 2026,
): SimpleGraph {
  const rng = random(seed)
  const edges: Array<[number, number]> = []
  const used = new Set<string>()
  for (let node = 0; node < n; node++) {
    for (let offset = 1; offset <= k / 2; offset++) {
      const original = (node + offset) % n
      let target = original
      if (rng() < probability) {
        do target = Math.floor(rng() * n)
        while (target === node || used.has(edgeKey(node, target)))
      }
      used.add(edgeKey(node, target))
      edges.push(node < target ? [node, target] : [target, node])
    }
  }
  return { name: "Watts–Strogatz", nodes: n, edges }
}

export function barabasiAlbert(n: number, m = 5, seed = 2026): SimpleGraph {
  const rng = random(seed)
  const edges: Array<[number, number]> = []
  const endpoints: number[] = []
  for (let a = 0; a < m + 1; a++) {
    for (let b = a + 1; b < m + 1; b++) {
      edges.push([a, b])
      endpoints.push(a, b)
    }
  }
  for (let node = m + 1; node < n; node++) {
    const targets = new Set<number>()
    while (targets.size < m) {
      targets.add(endpoints[Math.floor(rng() * endpoints.length)] ?? 0)
    }
    for (const target of targets) {
      edges.push([target, node])
      endpoints.push(target, node)
    }
  }
  return { name: "Barabási–Albert", nodes: n, edges }
}

export function degreePreservingShuffle(
  graph: SimpleGraph,
  swaps: number,
  seed: number,
): SimpleGraph {
  const rng = random(seed)
  const edges = graph.edges.map(([a, b]) => [a, b] as [number, number])
  const used = new Set(edges.map(([a, b]) => edgeKey(a, b)))
  let completed = 0
  let attempts = 0
  while (completed < swaps && attempts < swaps * 30) {
    attempts++
    const first = Math.floor(rng() * edges.length)
    const second = Math.floor(rng() * edges.length)
    if (first === second) continue
    const one = edges[first]
    const two = edges[second]
    if (!one || !two) continue
    const [a, b] = one
    const [c, d] = two
    if (new Set([a, b, c, d]).size < 4) continue
    const nextOne: [number, number] = rng() < 0.5 ? [a, d] : [a, c]
    const nextTwo: [number, number] = nextOne[1] === d ? [c, b] : [b, d]
    const keyOne = edgeKey(...nextOne)
    const keyTwo = edgeKey(...nextTwo)
    if (used.has(keyOne) || used.has(keyTwo) || keyOne === keyTwo) continue
    used.delete(edgeKey(a, b))
    used.delete(edgeKey(c, d))
    used.add(keyOne)
    used.add(keyTwo)
    edges[first] = nextOne
    edges[second] = nextTwo
    completed++
  }
  return { name: "Degree-preserving shuffle", nodes: graph.nodes, edges }
}

export function ccdf(degrees: number[]) {
  const max = Math.max(0, ...degrees)
  return Array.from({ length: max }, (_, index) => {
    const k = index + 1
    return { k, p: degrees.filter((degree) => degree >= k).length / degrees.length }
  }).filter((point) => point.p > 0)
}

export function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function deviation(values: number[]) {
  const average = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)))
}
