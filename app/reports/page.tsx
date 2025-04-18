import { WeeklyReportViewer } from "@/components/weekly-report"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReportsPage() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 현황 리포트</h1>
          <p className="text-[#6e6e85] mt-1">매주 월요일 자동 생성되는 프로젝트 변경 사항 리포트</p>
        </div>

        <WeeklyReportViewer />
      </div>
    </main>
  )
}
