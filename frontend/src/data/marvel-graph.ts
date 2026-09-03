import raw from "@/data/week1-graph.json"

export type GraphStats = {
  n: number
  l: number
  density: number
  meanIn: number
  meanOut: number
  maxIn: number
  maxOut: number
  isolates: number
  reciprocity: number
}

export type MarvelNode = {
  id: string
  name: string
  wikidata_id: string
  url: string
  description: string
  val: number
  inDegree: number
  outDegree: number
}

export type MarvelLink = {
  source: string
  target: string
}

export type MarvelGraph = {
  nodes: MarvelNode[]
  links: MarvelLink[]
  stats: GraphStats
}

export const week1Graph = raw as MarvelGraph
export const week1Stats = week1Graph.stats

export const week1MaxDegree = week1Graph.nodes.reduce(
  (max, node) => Math.max(max, node.val),
  0,
)

export function cloneMarvelGraph(graph: MarvelGraph): MarvelGraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node })),
    links: graph.links.map((link) => ({ ...link })),
    stats: graph.stats,
  }
}

export function isNodeInDegreeFilter(
  degree: number,
  threshold: number,
  invert: boolean,
  maxDegree = week1MaxDegree,
) {
  if (invert) return degree <= maxDegree - threshold
  return degree >= threshold
}

export type InducedDegree = {
  id: string
  inDegree: number
  outDegree: number
}

export function visibleNodeIds(
  graph: MarvelGraph,
  threshold: number,
  invert: boolean,
) {
  return new Set(
    graph.nodes
      .filter((node) => isNodeInDegreeFilter(node.val, threshold, invert))
      .map((node) => node.id),
  )
}

export function inducedDegrees(
  graph: MarvelGraph,
  visibleIds: Set<string>,
): InducedDegree[] {
  const incoming = new Map<string, number>()
  const outgoing = new Map<string, number>()
  for (const id of visibleIds) {
    incoming.set(id, 0)
    outgoing.set(id, 0)
  }
  for (const link of graph.links) {
    if (!visibleIds.has(link.source) || !visibleIds.has(link.target)) continue
    outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + 1)
    incoming.set(link.target, (incoming.get(link.target) ?? 0) + 1)
  }
  return [...visibleIds].map((id) => ({
    id,
    inDegree: incoming.get(id) ?? 0,
    outDegree: outgoing.get(id) ?? 0,
  }))
}

export function inducedStats(degrees: InducedDegree[]) {
  const n = degrees.length
  const l = degrees.reduce((sum, node) => sum + node.outDegree, 0)
  const inDegrees = degrees.map((node) => node.inDegree)
  const outDegrees = degrees.map((node) => node.outDegree)
  return {
    n,
    l,
    density: n > 1 ? l / (n * (n - 1)) : 0,
    meanIn: n ? l / n : 0,
    meanOut: n ? l / n : 0,
    maxIn: inDegrees.length ? Math.max(...inDegrees) : 0,
    maxOut: outDegrees.length ? Math.max(...outDegrees) : 0,
    isolates: degrees.filter(
      (node) => node.inDegree === 0 && node.outDegree === 0,
    ).length,
  }
}
