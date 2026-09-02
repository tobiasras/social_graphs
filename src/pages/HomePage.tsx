import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { weeks } from "@/data/weeks"
import { SceneFrame } from "@/scenes/SceneFrame"
import { HomeNetwork } from "@/scenes/HomeNetwork"

export function HomePage() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <div className="absolute inset-0">
        <SceneFrame enableControls={false} cameraPosition={[0, 0.4, 9]}>
          <HomeNetwork />
        </SceneFrame>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-background/55 to-background" />

      <main className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-4">
            8 weeks · Three.js
          </Badge>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Social Graphs
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground text-pretty">
            A weekly studio of 3D network sketches. Pick a week to open its
            Three.js scene — drag to orbit, scroll to zoom.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {weeks.map((week) => (
            <Link key={week.id} to={`/week/${week.id}`} className="group">
              <Card className="h-full bg-card/75 backdrop-blur-md transition duration-200 group-hover:-translate-y-1 group-hover:ring-foreground/20">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary">Week {week.id}</Badge>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: week.accent }}
                    />
                  </div>
                  <CardTitle>{week.title}</CardTitle>
                  <CardDescription>{week.subtitle}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-between text-muted-foreground">
                  <span className="line-clamp-1">{week.description}</span>
                  <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
                </CardFooter>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
