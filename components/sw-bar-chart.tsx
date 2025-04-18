"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

// 파스텔 톤 색상 - 이미지에 표시된 항목들에 맞게 업데이트
const COLORS: Record<string, string> = {
  사내IT팀: "#d8d9f8", // 연한 보라색
  파트너: "#f3e8d2", // 연한 베이지색
  "크루(NOCODE)": "#e2f4e2", // 연한 녹색
  "현업(NOCODE)": "#f9e0c3", // 연한 주황색
  "52g 스튜디오": "#d6e9f8", // 연한 파란색
  미사용: "#f9f3c3", // 연한 노란색
  없음: "#e9e9e9", // 연한 회색
  크루: "#e0e0e0", // 회색
}

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const color = COLORS[payload[0].payload.name] || "#8884d8"
    return (
      <div className="bg-white p-3 shadow-sm rounded-lg border border-gray-100">
        <p className="font-medium text-gray-800" style={{ color: "#555" }}>
          {payload[0].payload.name}
        </p>
        <p className="text-lg font-bold text-gray-900">{payload[0].value}개</p>
      </div>
    )
  }
  return null
}

export function SWBarChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 값이 0인 항목 필터링
  const filteredData = [...data].filter((item) => item.value > 0)

  // 데이터 정렬 (값이 큰 순서대로)
  const sortedData = filteredData.sort((a, b) => b.value - a.value)

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
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#d9d9d9"} />
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
