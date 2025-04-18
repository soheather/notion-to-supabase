"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProjectsList from "@/components/projects-list"
import { Loader2, AlertTriangle, Database, RefreshCw } from "lucide-react"
import { RefreshProjectsButton } from "@/components/refresh-projects-button"
import { SyncStatus } from "@/components/sync-status"
import { Button } from "@/components/ui/button"
import { checkProjectsTable, getCreateProjectsTableSQL } from "@/app/actions/projects"
import { useRouter } from "next/navigation"
import { CompanyFilter } from "@/components/company-filter"
import { ProjectSummaryCards } from "@/components/project-summary-cards"
import { ProjectDistributionChart } from "@/components/project-distribution-chart"

export function UnifiedProjectsView() {
  const [projectsData, setProjectsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [createTableSQL, setCreateTableSQL] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(true)
  const router = useRouter()

  // 테이블 존재 여부 확인
  useEffect(() => {
    const checkTable = async () => {
      try {
        const result = await checkProjectsTable()
        setTableExists(result.exists)

        if (!result.exists) {
          const sql = await getCreateProjectsTableSQL()
          setCreateTableSQL(sql)
        }
      } catch (err) {
        console.error("테이블 확인 오류:", err)
      }
    }

    checkTable()
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    if (!tableExists) return

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
  }, [tableExists])

  // 실시간 구독 설정
  useEffect(() => {
    if (!realtimeEnabled || !tableExists) return

    console.log("실시간 구독 설정 중...")

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

            setLastUpdated(new Date().toLocaleString("ko-KR") + " (실시간 업데이트)")
          }
        },
      )
      .subscribe()

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log("실시간 구독 해제")
      subscription.unsubscribe()
    }
  }, [realtimeEnabled, tableExists])

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

  // 회사별로 필터링된 프로젝트 목록 반환
  const getFilteredProjects = () => {
    if (!projectsData || !projectsData.results) return []

    // 먼저 회사명 통합 처리
    const normalizedProjects = projectsData.results.map((project: any) => {
      // 회사명 정규화
      let normalizedCompany = project.company || "-"

      // GS E&R 관련 회사명 통합
      if (
        normalizedCompany.includes("GS E&R") ||
        normalizedCompany.includes("GS동해전력") ||
        normalizedCompany.includes("포천그린에너지")
      ) {
        normalizedCompany = "GS E&R"
      }

      return {
        ...project,
        company: normalizedCompany,
      }
    })

    let filtered = normalizedProjects

    // 회사 필터링
    if (selectedCompany) {
      filtered = filtered.filter((project: any) => project.company === selectedCompany)
    }

    // 카테고리 필터링
    if (selectedCategory) {
      if (selectedCategory === "planning") {
        filtered = filtered.filter(
          (project: any) =>
            project.stage?.includes("진행후보") ||
            project.stage?.includes("진행보류") ||
            project.stage?.includes("진행확정"),
        )
      } else if (selectedCategory === "inProgress") {
        filtered = filtered.filter(
          (project: any) =>
            project.stage?.includes("개발") ||
            project.stage?.includes("Development") ||
            project.stage?.includes("진행중") ||
            project.stage?.includes("테스트") ||
            project.stage?.includes("Testing"),
        )
      } else if (selectedCategory === "completed") {
        filtered = filtered.filter((project: any) => project.stage === "진행완료")
      }
    }

    return filtered
  }

  // 프로젝트 통계 계산 함수
  const getProjectStats = (projects: any[]) => {
    if (!projects || projects.length === 0) {
      return {
        totalProjects: 0,
        planningProjects: 0,
        inProgressProjects: 0,
        completedProjects: 0,
      }
    }

    // 전체 프로젝트 수
    const totalProjects = projects.length

    // 기획 단계 프로젝트 필터링
    const planningProjects = projects.filter(
      (project) =>
        project.stage?.includes("진행후보") ||
        project.stage?.includes("진행보류") ||
        project.stage?.includes("진행확정"),
    ).length

    // 진행 중인 프로젝트 필터링
    const inProgressProjects = projects.filter(
      (project) =>
        project.stage?.includes("개발") ||
        project.stage?.includes("Development") ||
        project.stage?.includes("진행중") ||
        project.stage?.includes("테스트") ||
        project.stage?.includes("Testing"),
    ).length

    // 완료된 프로젝트 필터링
    const completedProjects = projects.filter((project) => project.stage === "진행완료").length

    return {
      totalProjects,
      planningProjects,
      inProgressProjects,
      completedProjects,
    }
  }

  // 테이블이 존재하지 않는 경우
  if (!tableExists) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
          <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 실시간 동기화</p>
        </div>
        <div className="bg-[#fff2c4] border border-[#ffe7a0] rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-[#a17f22] mr-2" />
            <h3 className="text-[#a17f22] text-lg font-medium">Supabase 테이블이 없습니다</h3>
          </div>
          <p className="text-[#a17f22] mb-4">
            Supabase 데이터베이스에 'project_list' 테이블이 존재하지 않습니다. 아래 SQL을 사용하여 Supabase 대시보드에서
            테이블을 생성해주세요.
          </p>
          <pre className="bg-[#ffe7a0] bg-opacity-30 p-4 rounded-md overflow-auto text-sm">
            <code>{createTableSQL}</code>
          </pre>
          <div className="mt-6">
            <Button asChild className="bg-[#a17f22] hover:bg-[#8a6a1d] text-white">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Database className="h-4 w-4 mr-2" />
                Supabase 대시보드 열기
              </a>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (loading && !projectsData) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
          <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 동기화</p>
        </div>
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
          <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
          <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 동기화</p>
        </div>
        <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
          <h3 className="text-[#c44f6a] text-lg font-medium mb-2">데이터 로드 오류</h3>
          <p className="text-[#c44f6a]">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-white text-[#c44f6a] rounded-md hover:bg-[#fff5f7]"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            다시 시도
          </button>
        </div>
      </>
    )
  }

  const filteredProjects = getFilteredProjects()
  const stats = getProjectStats(filteredProjects)

  // 퍼센트 계산 (0으로 나누기 방지)
  const calculatePercent = (value: number, total: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const planningPercent = calculatePercent(stats.planningProjects, stats.totalProjects)
  const inProgressPercent = calculatePercent(stats.inProgressProjects, stats.totalProjects)
  const completedPercent = calculatePercent(stats.completedProjects, stats.totalProjects)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
          <div className="flex items-center gap-2 mt-1">
            <SyncStatus />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {projectsData && (
            <CompanyFilter
              projects={projectsData.results}
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
            />
          )}
          <RefreshProjectsButton />
        </div>
      </div>

      {/* 항상 요약 정보 표시 */}
      <div className="space-y-6 mb-8">
        <ProjectSummaryCards
          totalProjects={stats.totalProjects}
          planningProjects={stats.planningProjects}
          inProgressProjects={stats.inProgressProjects}
          completedProjects={stats.completedProjects}
          title={selectedCompany ? `${selectedCompany} 프로젝트 현황` : "프로젝트 현황"}
          onCategoryClick={setSelectedCategory}
        />

        <ProjectDistributionChart
          planningPercentage={planningPercent}
          inProgressPercentage={inProgressPercent}
          completedPercentage={completedPercent}
          planningCount={stats.planningProjects}
          inProgressCount={stats.inProgressProjects}
          completedCount={stats.completedProjects}
          totalCount={stats.totalProjects}
        />
      </div>

      {projectsData && (
        <ProjectsList
          projectsData={{
            ...projectsData,
            results: filteredProjects,
          }}
        />
      )}
    </div>
  )
}
