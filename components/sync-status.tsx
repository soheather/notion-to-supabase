"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock } from "lucide-react"

export function SyncStatus() {
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [nextSync, setNextSync] = useState<string | null>(null)

  useEffect(() => {
    // 마지막 동기화 시간 가져오기 (로컬 스토리지에서)
    const storedLastSync = localStorage.getItem("lastProjectSync")
    if (storedLastSync) {
      setLastSync(storedLastSync)
    }

    // 다음 동기화 시간 계산 (매일 오전 9시)
    const now = new Date()
    const nextSyncDate = new Date(now)

    // 이미 오늘 오전 9시가 지났으면 내일 오전 9시로 설정
    if (now.getHours() >= 9) {
      nextSyncDate.setDate(nextSyncDate.getDate() + 1)
    }

    nextSyncDate.setHours(9, 0, 0, 0)
    setNextSync(nextSyncDate.toLocaleString("ko-KR"))

    // 현재 페이지 로드 시 동기화 상태 업데이트
    const updateSyncStatus = async () => {
      try {
        const response = await fetch("/api/cron/sync-projects", {
          method: "GET",
          headers: { "x-manual-check": "true" },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const syncTime = new Date().toLocaleString("ko-KR")
            localStorage.setItem("lastProjectSync", syncTime)
            setLastSync(syncTime)
          }
        }
      } catch (error) {
        console.error("동기화 상태 확인 오류:", error)
      }
    }

    // 페이지 로드 시 동기화 상태 확인 (실제 동기화는 하지 않음)
    updateSyncStatus()
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-[#f8f8fc]">
              <Clock className="h-3 w-3 text-[#a5a6f6]" />
              <span className="text-xs">자동 동기화</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-xs">
          <div className="space-y-2">
            <p className="text-sm font-medium">프로젝트 데이터 자동 동기화</p>
            <p className="text-xs text-gray-500">매일 오전 9시에 자동으로 Supabase DB와 동기화됩니다.</p>
            {lastSync && <p className="text-xs">마지막 동기화: {lastSync}</p>}
            {nextSync && <p className="text-xs">다음 동기화: {nextSync}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
