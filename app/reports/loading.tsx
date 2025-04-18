import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 현황 리포트</h1>
          <p className="text-[#6e6e85] mt-1">매주 월요일 자동 생성되는 프로젝트 변경 사항 리포트</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
            <p className="text-[#6e6e85]">리포트 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    </main>
  )
}
