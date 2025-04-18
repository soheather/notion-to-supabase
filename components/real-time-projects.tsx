"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProjectsList from "@/components/projects-list"
import { Loader2 } from "lucide-react"
import { RefreshProjectsButton } from "@/components/refresh-projects-button"
import { SyncStatus } from "@/components/sync-status"

export function RealTimeProjects() {
  const [projectsData, setProjectsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        // Supabase에서 프로젝트 데이터 가져오기
        const { data, error } = await supabase
          .from("project_list")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setProjectsData({
          results: data || [],
          count: data?.length || 0,
          timestamp: new Date().toISOString(),
          refreshed: true,
        })

        setLastUpdated(new Date().toLocaleString("ko-KR"))
      } catch (err) {
        console.error("데이터 로드 오류:", err)
        setError(err instanceof Error ? err.message : "데이터를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    // 실시간 구독 설정
    const subscription = supabase
      .channel("project_list_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // 모든 이벤트(INSERT, UPDATE, DELETE) 구독
          schema: "public",
          table: "project_list",
        },
        async (payload) => {
          console.log("실시간 변경 감지:", payload)

          // 변경 사항이 감지되면 전체 데이터 다시 로드
          // 대규모 데이터의 경우 최적화가 필요할 수 있음
          const { data, error } = await supabase
            .from("project_list")
            .select("*")
            .order("created_at", { ascending: false })

          if (!error && data) {
            setProjectsData({
              results: data,
              count: data.length,
              timestamp: new Date().toISOString(),
              refreshed: true,
            })

            setLastUpdated(new Date().toLocaleString("ko-KR"))
          }
        },
      )
      .subscribe()

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 수동 새로고침 함수
  const refreshData = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.from("project_list").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setProjectsData({
        results: data || [],
        count: data?.length || 0,
        timestamp: new Date().toISOString(),
        refreshed: true,
      })

      setLastUpdated(new Date().toLocaleString("ko-KR"))
    } catch (err) {
      console.error("데이터 새로고침 오류:", err)
      setError(err instanceof Error ? err.message : "데이터를 새로고침하는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !projectsData) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
        <h3 className="text-[#c44f6a] text-lg font-medium mb-2">데이터 로드 오류</h3>
        <p className="text-[#c44f6a]">{error}</p>
        <button onClick={refreshData} className="mt-4 px-4 py-2 bg-white text-[#c44f6a] rounded-md hover:bg-[#fff5f7]">
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트 (실시간)</h1>
          <div className="flex items-center gap-2 mt-1">
            <SyncStatus />
            {lastUpdated && (
              <span className="text-xs text-[#6e6e85]">마지막 업데이트: {lastUpdated} (실시간 동기화 활성화됨)</span>
            )}
          </div>
        </div>
        <RefreshProjectsButton />
      </div>

      {projectsData && <ProjectsList projectsData={projectsData} />}
    </div>
  )
}
