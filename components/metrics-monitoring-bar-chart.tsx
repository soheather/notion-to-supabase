"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

// 파스텔 톤 색상
const COLORS = {
  있음: "#a5b4fc", // 연한 보라색
  없음: "#fca5a5", // 연한 빨간색
  정기: "#86efac", // 연한 녹색
  비정기: "#fcd34d", // 연한 노란색
}

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const color = COLORS[payload[0].payload.name as keyof typeof COLORS] || "#8884d8"
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

export function MetricsMonitoringBarChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 값이 0인 항목 필터링 후 정렬
  const filteredData = [...data]
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      name: translateYesNo(item.name),
    }))
    .sort((a, b) => {
      if (a.name === "정기") return -1
      if (b.name === "정기") return 1
      if (a.name === "비정기") return -1
      if (b.name === "비정기") return 1
      return 0
    })

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "#f9fafb", radius: [0, 4, 4, 0] }}>
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"} />
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

// Yes/No 값을 한글로 변환하는 헬퍼 함수
function translateYesNo(value: string): string {
  if (value.toLowerCase() === "yes") return "있음"
  if (value.toLowerCase() === "no") return "없음"
  return value
}
