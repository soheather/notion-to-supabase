"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

// 파스텔 톤 색상
const COLORS = {
  "2020 이전": "#d8d9f8", // 연한 보라색
  "2020~2021": "#c5e8ff", // 연한 하늘색
  "2021~2022": "#e1f5c4", // 연한 녹색
  "2022~2023": "#ffd6e0", // 연한 분홍색
  "2023~현재": "#fff2c4", // 연한 노란색
  미지정: "#e9e9f2", // 연한 회색
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

export function PeriodBarChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 값이 0인 항목 필터링 후 정렬
  const filteredData = [...data]
    .filter((item) => item.value > 0)
    .sort((a, b) => {
      // 특정 순서로 정렬
      const order = {
        "2020 이전": 1,
        "2020~2021": 2,
        "2021~2022": 3,
        "2022~2023": 4,
        "2023~현재": 5,
        미지정: 6,
      }
      return (order[a.name as keyof typeof order] || 999) - (order[b.name as keyof typeof order] || 999)
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
            width={100}
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
