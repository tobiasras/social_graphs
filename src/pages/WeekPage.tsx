import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getWeek } from "@/data/weeks"
import { SceneFrame } from "@/scenes/SceneFrame"
import { weekScenes } from "@/scenes/weekScenes"

export function WeekPage() {
  const { weekId } = useParams()
  const id = Number(weekId)
  const week = getWeek(id)
  const config = weekScenes[id]

  if (!week || !config) {
    return <Navigate to="/" replace />
  }

  const Scene = config.Scene

  return (
    <div className="relative h-svh overflow-hidden">
      <SceneFrame
        cameraPosition={config.cameraPosition}
        autoRotate={config.autoRotate ?? true}
      >
        <Scene />
      </SceneFrame>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background/80 to-transparent p-4 sm:p-6">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link to="/" aria-label="Back to weeks">
                <ArrowLeft />
              </Link>
            </Button>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary">Week {week.id}</Badge>
                <span className="text-xs text-muted-foreground">
                  {week.subtitle}
                </span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl">{week.title}</h1>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {week.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
