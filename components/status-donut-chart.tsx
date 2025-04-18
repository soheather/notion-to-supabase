"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from "recharts"

// 차트 색상 - 파스텔 톤으로 변경
export const COLORS = ["#6366f1", "#a5b4fc", "#f59e0b", "#fcd34d", "#10b981", "#86efac"]

// 커스텀 툴팁 스타일
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // 상태 이름 변환 - '사용'을 '사용중'으로 변경
    let displayName = payload[0].name
    if (displayName === "사용") {
      displayName = "사용중"
    }

    return (
      <div
        className="bg-white p-3 shadow-md rounded-lg border border-gray-100 z-50"
        style={{ position: "relative", zIndex: 1000 }}
      >
        <p className="font-medium text-gray-800">{displayName}</p>
        <p className="text-lg font-bold text-gray-900">{payload[0].value}개</p>
        <p className="text-sm text-gray-500">{((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

// 각 항목별 개수를 더 명확하게 표시하도록 수정
export function StatusDonutChart({ data }: { data: any[] }) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">데이터가 없습니다</div>
  }

  // 데이터 변환 - '사용'을 '사용중'으로 변경
  const transformedData = data.map((item) => ({
    ...item,
    name: item.name === "사용" ? "사용중" : item.name,
  }))

  // 전체 서비스 수 계산
  const totalServices = transformedData.reduce((sum, item) => sum + item.value, 0)

  // 각 항목에 total 속성 추가
  const dataWithTotal = transformedData.map((item) => ({
    ...item,
    total: totalServices,
    // 퍼센트 값 추가
    percent: Math.round((item.value / totalServices) * 100),
  }))

  return (
    <div className="w-full">
      <div className="relative">
        {/* 도넛 차트 */}
        <div className="w-full h-[350px] relative" style={{ position: "relative", zIndex: 1 }}>
          {/* 중앙 전체 서비스 수 표시 */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className="text-center bg-white rounded-full p-4"
              style={{
                width: "140px",
                height: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text-sm font-medium text-gray-600">전체 디지털 서비스</div>
              <div className="text-4xl font-bold text-gray-900">{totalServices}개</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                cornerRadius={3}
                label={({ name, value }) => {
                  // 라벨에서도 '사용'을 '사용중'으로 변경
                  const displayName = name === "사용" ? "사용중" : name
                  return `${displayName} ${value}개`
                }}
                labelLine={false}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
                {/* 퍼센트 표시를 위한 LabelList 추가 */}
                <LabelList
                  dataKey="percent"
                  position="center"
                  formatter={(value: number) => `${value}%`}
                  style={{ fill: "white", fontWeight: "bold", fontSize: 14, textShadow: "0px 0px 2px rgba(0,0,0,0.5)" }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
