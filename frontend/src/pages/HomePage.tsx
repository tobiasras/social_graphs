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
            Week 1 · Three.js
          </Badge>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Socialy Graph
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground text-pretty">
            A 3D network sketch. Open week 1 — drag to orbit, scroll to zoom.
          </p>
        </header>

        <section className="grid max-w-sm gap-4">
          <Link to="/week1" className="group">
            <Card className="h-full bg-card/75 backdrop-blur-md transition duration-200 group-hover:-translate-y-1 group-hover:ring-foreground/20">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary">Week 1</Badge>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: "#7c9cff" }}
                  />
                </div>
                <CardTitle>Marvel Universe Graph</CardTitle>
                <CardDescription>Graph in 3d</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between text-muted-foreground">
                <span className="line-clamp-1">Open The Graph</span>
                <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
              </CardFooter>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  )
}
