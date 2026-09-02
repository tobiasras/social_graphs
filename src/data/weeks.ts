export type Week = {
  id: number
  title: string
  subtitle: string
  description: string
  accent: string
}

export const weeks: Week[] = [
  {
    id: 1,
    title: "Hello Cube",
    subtitle: "Meshes & materials",
    description:
      "Start in 3D with primitives, lighting, and a rotating mesh.",
    accent: "#7c9cff",
  },
  {
    id: 2,
    title: "Orbits",
    subtitle: "Motion in space",
    description:
      "Nodes travel on circular paths around a shared center of gravity.",
    accent: "#f0abfc",
  },
  {
    id: 3,
    title: "Particle Field",
    subtitle: "Points & sparkles",
    description:
      "Thousands of points form a drifting cloud of social atoms.",
    accent: "#67e8f9",
  },
  {
    id: 4,
    title: "Network Edges",
    subtitle: "Nodes and links",
    description:
      "A spherical graph: vertices connected by edges in 3D.",
    accent: "#86efac",
  },
  {
    id: 5,
    title: "Communities",
    subtitle: "Clustered groups",
    description:
      "Three communities sit apart, with a few bridges between them.",
    accent: "#fcd34d",
  },
  {
    id: 6,
    title: "Surfaces",
    subtitle: "Fields & waves",
    description:
      "A living mesh whose height encodes a changing signal.",
    accent: "#5eead4",
  },
  {
    id: 7,
    title: "Interaction",
    subtitle: "Pick a node",
    description:
      "Hover and click graph nodes. Drag to orbit the camera.",
    accent: "#fda4af",
  },
  {
    id: 8,
    title: "Galaxy",
    subtitle: "The full picture",
    description:
      "Stars, a core, and a web of ties — a social universe in Three.js.",
    accent: "#c4b5fd",
  },
]

export function getWeek(id: number) {
  return weeks.find((week) => week.id === id)
}
