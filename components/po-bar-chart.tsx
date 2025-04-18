"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

// 파스텔 톤 색상
const COLORS: Record<string, string> = {
  "현업/사내 IT팀": "#86efac", // 연한 녹색
  "52g 직단위원": "#fcd34d", // 연한 노란색
  없음: "#fca5a5", // 연한 빨간색
}

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const color = COLORS[payload[0].payload.name] || "#8884d8"
    return (
      <div className="bg-white p-3 shadow-sm rounded-lg border border-gray-100">
        <p className="font-medium text-gray-800" style={{ color }}>
          {payload[0].payload.name}
        </p>
        <p className="text-lg font-bold text-gray-900">{payload[0].value}개</p>
      </div>
    )
  }
  return null
}

export function POBarChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 데이터 정렬 (없음이 마지막에 오도록)
  const sortedData = [...data].sort((a, b) => {
    if (a.name === "없음") return 1
    if (b.name === "없음") return -1
    return b.value - a.value // 값이 큰 순서대로 정렬
  })

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "#f9fafb", radius: [0, 4, 4, 0] }}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884d8"} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: number) => `${value}개`}
              style={{ fill: "#374151", fontWeight: "bold", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
