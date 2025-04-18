import { UnifiedProjectsView } from "@/components/unified-projects-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ProjectsPage() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <UnifiedProjectsView />
      </div>
    </main>
  )
}
