export type DistPoint = {
  k: number
  p: number
}

export function exactDistribution(degrees: number[]): DistPoint[] {
  const n = degrees.length
  if (n === 0) return []
  const counts = new Map<number, number>()
  for (const degree of degrees) {
    counts.set(degree, (counts.get(degree) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, count]) => ({ k, p: count / n }))
}

export function groupedDistribution(degrees: number[]): DistPoint[] {
  const n = degrees.length
  if (n === 0) return []

  const points: DistPoint[] = []
  const zeros = degrees.filter((degree) => degree === 0).length
  if (zeros > 0) {
    points.push({ k: 0, p: zeros / n })
  }

  const max = Math.max(0, ...degrees)
  let lo = 1
  while (lo <= max) {
    const hi = lo * 2
    const width = hi - lo
    const count = degrees.filter((degree) => degree >= lo && degree < hi).length
    if (count > 0) {
      points.push({
        k: lo * Math.SQRT2,
        p: count / (n * width),
      })
    }
    lo = hi
  }
  return points
}

export function forLogLog(points: DistPoint[]): DistPoint[] {
  return points.filter((point) => point.k > 0 && point.p > 0)
}

export function scaleValue(
  value: number,
  min: number,
  max: number,
  logScale: boolean,
) {
  if (max <= min) return 0
  if (!logScale) return (value - min) / (max - min)
  return (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
}
