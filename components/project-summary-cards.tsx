"use client"

import { BarChart3, Clock, ListChecks, CheckCircle2 } from "lucide-react"

interface ProjectSummaryCardsProps {
  totalProjects: number
  planningProjects: number
  inProgressProjects: number
  completedProjects: number
  title?: string
  onCategoryClick?: (category: string | null) => void
}

export function ProjectSummaryCards({
  totalProjects,
  planningProjects,
  inProgressProjects,
  completedProjects,
  title,
  onCategoryClick,
}: ProjectSummaryCardsProps) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#a5a6f6]" />
          <h2 className="text-xl font-bold text-[#2d2d3d]">{title}</h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => onCategoryClick && onCategoryClick(null)}
        >
          <div className="rounded-full bg-[#f0f0ff] p-3 mr-4">
            <BarChart3 className="h-6 w-6 text-[#7b7bf7]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">전체 프로젝트</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{totalProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => onCategoryClick && onCategoryClick("planning")}
        >
          <div className="rounded-full bg-[#fff2c4] bg-opacity-50 p-3 mr-4">
            <Clock className="h-6 w-6 text-[#a17f22]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행후보/확정</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{planningProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => onCategoryClick && onCategoryClick("inProgress")}
        >
          <div className="rounded-full bg-[#c5e8ff] bg-opacity-50 p-3 mr-4">
            <ListChecks className="h-6 w-6 text-[#3a6ea5]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행중</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{inProgressProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => onCategoryClick && onCategoryClick("completed")}
        >
          <div className="rounded-full bg-[#e1f5c4] bg-opacity-50 p-3 mr-4">
            <CheckCircle2 className="h-6 w-6 text-[#5a7052]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행완료</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{completedProjects}개</p>
          </div>
        </div>
      </div>
    </div>
  )
}
