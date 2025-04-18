"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"

// 파스텔 톤 색상 정의
const COLORS = {
  "진행후보/확정": "#fff2c4", // 연한 노란색
  진행중: "#c5e8ff", // 연한 파란색
  진행완료: "#e1f5c4", // 연한 녹색
}

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-sm rounded-lg border border-gray-100">
        <p className="font-medium text-gray-800 mb-2">프로젝트 분포</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">{entry.name}: </span>
            <span className="ml-1 font-medium text-gray-900">{entry.value}개</span>
            <span className="ml-1 text-gray-500">({entry.payload[`${entry.dataKey}Percentage`]}%)</span>
          </div>
        ))}
        <div className="mt-1 pt-1 border-t border-gray-100">
          <span className="text-gray-700">전체: </span>
          <span className="font-medium text-gray-900">{payload[0].payload.total}개</span>
        </div>
      </div>
    )
  }
  return null
}

interface ProjectStageChartProps {
  data: {
    name: string
    value: number
    percentage: number
    color: string
  }[]
}

export function ProjectStageChart({ data }: ProjectStageChartProps) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 전체 프로젝트 수 계산
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0)

  // 분할 막대 그래프용 데이터 변환
  const dividedBarData = [
    {
      name: "프로젝트 분포",
      "진행후보/확정": data.find((item) => item.name === "진행후보/확정")?.value || 0,
      "진행후보/확정Percentage": data.find((item) => item.name === "진행후보/확정")?.percentage || 0,
      진행중: data.find((item) => item.name === "진행중")?.value || 0,
      진행중Percentage: data.find((item) => item.name === "진행중")?.percentage || 0,
      진행완료: data.find((item) => item.name === "진행완료")?.value || 0,
      진행완료Percentage: data.find((item) => item.name === "진행완료")?.percentage || 0,
      total: totalProjects,
    },
  ]

  return (
    <div className="w-full h-[350px]">
      <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
        <div>전체 프로젝트: {totalProjects}개</div>
        <div className="flex items-center gap-4">
          {Object.entries(COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          layout="vertical"
          data={dividedBarData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            domain={[0, totalProjects]}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* 진행후보/확정 */}
          <Bar dataKey="진행후보/확정" stackId="a" fill={COLORS["진행후보/확정"]} radius={[4, 0, 0, 4]}>
            <LabelList
              dataKey="진행후보/확정Percentage"
              position="center"
              formatter={(value: number) => (value > 10 ? `${value}%` : "")}
              style={{ fill: "#4b4b63", fontWeight: "bold", fontSize: 12 }}
            />
          </Bar>

          {/* 진행중 */}
          <Bar dataKey="진행중" stackId="a" fill={COLORS["진행중"]}>
            <LabelList
              dataKey="진행중Percentage"
              position="center"
              formatter={(value: number) => (value > 10 ? `${value}%` : "")}
              style={{ fill: "#4b4b63", fontWeight: "bold", fontSize: 12 }}
            />
          </Bar>

          {/* 진행완료 */}
          <Bar dataKey="진행완료" stackId="a" fill={COLORS["진행완료"]} radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="진행완료Percentage"
              position="center"
              formatter={(value: number) => (value > 10 ? `${value}%` : "")}
              style={{ fill: "#4b4b63", fontWeight: "bold", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 text-center mt-2">
        각 영역에 표시된 퍼센트(%)는 전체 프로젝트 대비 비율입니다
      </div>
    </div>
  )
}

