"use client"

import { ArrowUpIcon } from "lucide-react"

export function StatusMetricCards({ data }: { data: any }) {
  const { totalCount, activeCount, metricsCount, assignedCount } = data

  // 사용 중인 서비스 비율
  const activePercentage = Math.round((activeCount / totalCount) * 100)

  // 지표가 있는 서비스 비율
  const metricsPercentage = Math.round((metricsCount / totalCount) * 100)

  // PO가 배정된 서비스 비율
  const assignedPercentage = Math.round((assignedCount / totalCount) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard icon="📋" title="완료된 작업" value={`${activePercentage}%`} bgColor="bg-[#e8f4f4]" />

      <MetricCard icon="⭐" title="사용성 지표" value={`${metricsPercentage}%`} bgColor="bg-[#f0f9d7]" trend={3} />

      <MetricCard icon="⏱️" title="담당자 배정률" value={`${assignedPercentage}%`} bgColor="bg-[#e9e3f7]" />
    </div>
  )
}

function MetricCard({
  icon,
  title,
  value,
  bgColor,
  trend,
}: {
  icon: string
  title: string
  value: string
  bgColor: string
  trend?: number
}) {
  return (
    <div className={`${bgColor} rounded-xl p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-600 text-sm mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
        </div>

        <div className="text-2xl">{icon}</div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <div className="bg-[#e1f7d5] text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <ArrowUpIcon className="h-3 w-3 mr-1" />
            {trend}%
          </div>
        </div>
      )}
    </div>
  )
}
