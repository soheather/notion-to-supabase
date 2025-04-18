"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

// 파스텔 톤 색상 팔레트
const COLORS = [
  "#a5b4fc", // 연한 보라색
  "#c5e8ff", // 연한 하늘색
  "#e1f5c4", // 연한 녹색
  "#ffd6e0", // 연한 분홍색
  "#fff2c4", // 연한 노란색
  "#f9e0c3", // 연한 주황색
  "#d8d9f8", // 연한 남색
  "#e9e9f2", // 연한 회색
]

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-sm rounded-lg border border-gray-100">
        <p className="font-medium text-gray-800">
          {payload[0].payload.name === "미지정" ? "년도 미지정" : `${payload[0].payload.name}년`}
        </p>
        <p className="text-lg font-bold text-gray-900">{payload[0].value}개</p>
        <p className="text-xs text-gray-500">전체 대비 비율: {payload[0].payload.percentage}%</p>
      </div>
    )
  }
  return null
}

export function YearBarChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 전체 합계 계산
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // 퍼센트 추가 및 값이 0인 항목 필터링
  const processedData = data
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      percentage: Math.round((item.value / total) * 100),
    }))

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(value) => (value === "미지정" ? "미지정" : `${value}년`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "#f9fafb", radius: [0, 4, 4, 0] }}>
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.name === "미지정" ? "#e9e9f2" : COLORS[index % COLORS.length]} />
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
