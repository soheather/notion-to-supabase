"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function RefreshProjectsButton() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const router = useRouter()

  // 컴포넌트 마운트 시 현재 시간으로 초기화
  useEffect(() => {
    setLastUpdated(new Date().toLocaleString("ko-KR"))
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      console.log("데이터 업데이트 시작...")

      // 캐시 무효화를 위한 타임스탬프 추가
      const timestamp = Date.now()

      // 서버에 새로운 데이터 요청 - 캐시 무효화 헤더 추가
      const response = await fetch(`/api/projects?timestamp=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "데이터 새로고침 실패")
      }

      const data = await response.json()
      console.log("데이터 업데이트 성공:", data.count, "개의 프로젝트 로드됨")

      // 최신 업데이트 시간 갱신
      setLastUpdated(new Date().toLocaleString("ko-KR"))

      // 페이지 새로고침 (서버 컴포넌트 리렌더링)
      router.refresh()

      // 성공 메시지
      console.log("프로젝트 데이터가 성공적으로 업데이트되었습니다.")
    } catch (error) {
      console.error("데이터 새로고침 오류:", error)
      alert(`데이터 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // 약간의 지연 후 로딩 상태 해제 (UX 개선)
      setTimeout(() => {
        setRefreshing(false)
      }, 500)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <Button onClick={handleRefresh} disabled={refreshing} className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white">
        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "업데이트 중..." : "데이터 업데이트"}
      </Button>
      {lastUpdated && <span className="text-xs text-[#6e6e85] mt-1">최근 업데이트: {lastUpdated}</span>}
    </div>
  )
}
