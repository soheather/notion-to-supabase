"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SyncStatus() {
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [nextSync, setNextSync] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // 수동 동기화 함수
  const manualSync = async () => {
    if (isSyncing) return

    try {
      setIsSyncing(true)
      const response = await fetch("/api/cron/sync-projects", {
        headers: { "x-manual-check": "true" },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const syncTime = new Date().toLocaleString("ko-KR")
          localStorage.setItem("lastProjectSync", syncTime)
          setLastSync(syncTime)

          // 성공 메시지 표시
          alert(`동기화 완료: ${data.data.count}개의 프로젝트 데이터가 업데이트되었습니다.`)
        }
      } else {
        alert("동기화 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("동기화 오류:", error)
      alert(`동기화 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSyncing(false)
    }
  }

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

    // 현재 페이지 로드 시 동기화 상태 확인 (실제 동기화는 하지 않음)
    const checkSyncStatus = async () => {
      try {
        // 마지막 동기화 시간이 없거나 24시간 이상 지났으면 동기화 상태 확인
        if (!storedLastSync || now.getTime() - new Date(storedLastSync).getTime() > 24 * 60 * 60 * 1000) {
          const response = await fetch("/api/cron/sync-projects", {
            method: "HEAD",
            headers: { "x-check-only": "true" },
          })

          if (response.ok) {
            console.log("동기화 상태 확인 완료")
          }
        }
      } catch (error) {
        console.error("동기화 상태 확인 오류:", error)
      }
    }

    checkSyncStatus()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-[#f8f8fc]">
              <Clock className="h-3 w-3 text-[#a5a6f6]" />
              <span className="text-xs">자동 동기화</span>
            </Badge>
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

      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs bg-[#f8f8fc] hover:bg-[#f0f0f8] text-[#6e6e85]"
        onClick={manualSync}
        disabled={isSyncing}
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "동기화 중..." : "지금 동기화"}
      </Button>
    </div>
  )
}
