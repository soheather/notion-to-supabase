"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"

// 파스텔 톤 색상 - 이미지 스타일에 맞게 설정
const COLORS = [
  "#a5a6f6", // 보라색
  "#c5e8ff", // 하늘색
  "#e1f5c4", // 연두색
  "#ffd6e0", // 분홍색
  "#fff2c4", // 노란색
  "#e9e9f2", // 회색
  "#d6e9f8", // 파란색
  "#f9e0c3", // 주황색
]

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-sm rounded-lg border border-[#f0f0f5]">
        <p className="font-medium text-[#4b4b63] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            <span className="text-[#6e6e85]">{entry.name}: </span>
            <span className="ml-1 font-medium text-[#2d2d3d]">{entry.value}개</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function MakeStackedChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-[#6e6e85]">데이터가 없습니다</div>
  }

  // 데이터 변환 - 'Make' 값을 기준으로 그룹화
  const groupedData: Record<string, number> = {}

  data.forEach((item) => {
    const make = item.make || "미지정"
    groupedData[make] = (groupedData[make] || 0) + 1
  })

  // 차트 데이터 형식으로 변환
  const chartData = [
    {
      name: "구현 방식",
      ...Object.keys(groupedData).reduce(
        (acc, key) => {
          acc[key] = groupedData[key]
          return acc
        },
        {} as Record<string, number>,
      ),
    },
  ]

  // 차트에 표시할 키 목록 (Make 값들)
  const keys = Object.keys(groupedData)

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6e6e85", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6e6e85", fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span className="text-[#4b4b63] text-sm">{value}</span>}
          />
          {keys.map((key, index) => (
            <Bar
              key={`bar-${key}`}
              dataKey={key}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              radius={[0, 0, 0, 0]}
              name={key}
            >
              <LabelList
                dataKey={key}
                position="center"
                formatter={(value: number) => {
                  const total = Object.values(groupedData).reduce((sum, val) => sum + val, 0)
                  const percentage = Math.round((value / total) * 100)
                  return percentage > 5 ? `${percentage}%` : ""
                }}
                style={{ fill: "white", fontWeight: "bold", fontSize: 11 }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
