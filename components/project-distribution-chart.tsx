"use client"

import { PieChart } from "lucide-react"

interface ProjectDistributionChartProps {
  planningPercentage: number
  inProgressPercentage: number
  completedPercentage: number
  planningCount: number
  inProgressCount: number
  completedCount: number
  totalCount: number
}

export function ProjectDistributionChart({
  planningPercentage,
  inProgressPercentage,
  completedPercentage,
  planningCount,
  inProgressCount,
  completedCount,
  totalCount,
}: ProjectDistributionChartProps) {
  // 데이터가 없는 경우 처리
  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="h-5 w-5 text-[#a5a6f6]" />
          <h2 className="text-xl font-bold text-[#2d2d3d]">프로젝트 단계별 분포</h2>
        </div>
        <div className="flex items-center justify-center h-32 text-[#6e6e85]">데이터가 없습니다</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5 text-[#a5a6f6]" />
        <h2 className="text-xl font-bold text-[#2d2d3d]">프로젝트 단계별 분포</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#2d2d3d]">전체 프로젝트: {totalCount}개</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#fff2c4]"></div>
              <span className="text-sm text-[#6e6e85]">진행후보/확정 ({planningCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c5e8ff]"></div>
              <span className="text-sm text-[#6e6e85]">진행중 ({inProgressCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e1f5c4]"></div>
              <span className="text-sm text-[#6e6e85]">진행완료 ({completedCount})</span>
            </div>
          </div>
        </div>

        <div className="relative h-12">
          <div className="absolute inset-0 flex rounded-lg overflow-hidden">
            {planningPercentage > 0 && (
              <div
                className="bg-[#fff2c4] flex items-center justify-center"
                style={{ width: `${planningPercentage}%` }}
              >
                {planningPercentage >= 10 && (
                  <span className="text-sm font-bold text-[#a17f22]">{planningPercentage}%</span>
                )}
              </div>
            )}
            {inProgressPercentage > 0 && (
              <div
                className="bg-[#c5e8ff] flex items-center justify-center"
                style={{ width: `${inProgressPercentage}%` }}
              >
                {inProgressPercentage >= 10 && (
                  <span className="text-sm font-bold text-[#3a6ea5]">{inProgressPercentage}%</span>
                )}
              </div>
            )}
            {completedPercentage > 0 && (
              <div
                className="bg-[#e1f5c4] flex items-center justify-center"
                style={{ width: `${completedPercentage}%` }}
              >
                {completedPercentage >= 10 && (
                  <span className="text-sm font-bold text-[#5a7052]">{completedPercentage}%</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between text-xs text-[#6e6e85]">
          <span>0</span>
          <span>{Math.floor(totalCount / 4)}</span>
          <span>{Math.floor(totalCount / 2)}</span>
          <span>{Math.floor((totalCount * 3) / 4)}</span>
          <span>{totalCount}</span>
        </div>

        <div className="text-center text-xs text-[#6e6e85] mt-4">
          각 영역에 표시된 퍼센트(%)는 전체 프로젝트 대비 비율입니다
        </div>
      </div>
    </div>
  )
}
