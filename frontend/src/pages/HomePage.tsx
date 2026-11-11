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
            Social Graphs · Course studio
          </Badge>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Social Graphs
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground text-pretty">
            Explore the weekly network work and the final project on food and cuisine.
          </p>
        </header>

        <section className="grid max-w-3xl gap-4 sm:grid-cols-2">
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
          <Link to="/week2" className="group">
            <Card className="h-full bg-card/75 backdrop-blur-md transition duration-200 group-hover:-translate-y-1 group-hover:ring-foreground/20">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary">Week 2</Badge>
                  <span className="size-2.5 rounded-full bg-blue-400" />
                </div>
                <CardTitle>Compared to what?</CardTitle>
                <CardDescription>Models, null models, and the Marvel network</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between text-muted-foreground">
                <span className="line-clamp-1">Open the analysis</span>
                <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
              </CardFooter>
            </Card>
          </Link>
          <Link to="/final-project" className="group sm:col-span-2">
            <Card className="h-full border-[#dfc9af] bg-[#f6ecda]/95 text-[#213a2e] backdrop-blur-md transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/20">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <Badge className="border-0 bg-[#ca553f] text-white">Final project</Badge>
                  <span className="text-xl text-[#ca553f]" aria-hidden="true">✳</span>
                </div>
                <CardTitle className="font-serif text-2xl">Every cuisine tells a story.</CardTitle>
                <CardDescription className="text-[#5e7061]">A warm new home for ingredients, connections, and cuisines.</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between text-[#486351]">
                <span>Take a first look</span>
                <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
              </CardFooter>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  )
}
