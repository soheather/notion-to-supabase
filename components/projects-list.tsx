"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react"
import { Loader2, Database } from "lucide-react"
import { fetchProjectsData } from "@/app/actions/projects"
// 필요한 import 추가
// import { Trash2 } from 'lucide-react'
// 상단에 import 부분에 추가할 내용
// import { BarChart3, CheckCircle2, Clock, ListChecks, PieChart } from 'lucide-react'
// 차트 컴포넌트 import
// import { ProjectStageChart } from "./project-stage-chart"

// ProjectItem 타입 정의를 테이블 구조와 일치시킵니다
type ProjectItem = {
  id: string
  created_at: string
  status: string
  stage: string
  pm: string
  company: string
  title: string
  training: boolean
  stakeholder: string
  project_doc: string
  genai: boolean
  digital_output: boolean
  expected_schedule: string
}

// Define the COLORS object
const COLORS = {
  진행후보: "#82ca9d",
  진행보류: "#a8a878",
  진행확정: "#f47564",
  진행중: "#3182bd",
  테스트: "#ffc658",
  완료: "#59b300",
  배포: "#008ee6",
  유지보수: "#9900ef",
  미정: "#e9e9e9",
  기타: "#e9e9e9",
}

export default function ProjectsList({ projectsData }: { projectsData: any }) {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectItem | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // 상태 변수 추가 (컴포넌트 시작 부분에 추가)
  // const [showPlanningProjects, setShowPlanningProjects] = useState(false)
  // const [showInProgressProjects, setShowInProgressProjects] = useState(false)
  // const [showCompletedProjects, setShowCompletedProjects] = useState(false)

  // projects 상태가 변경될 때마다 통계 데이터 업데이트
  useEffect(() => {
    console.log("프로젝트 데이터 변경됨, 통계 업데이트")
    // 프로젝트 통계 데이터 업데이트는 useMemo에서 자동으로 처리됨
  }, [projects])

  // 데이터 처리 부분에서 필드 매핑을 테이블 구조와 일치시킵니다
  useEffect(() => {
    try {
      if (!projectsData || !projectsData.results) {
        setProjects([])
        setLoading(false)
        return
      }

      // 타임스탬프 업데이트
      if (projectsData.timestamp) {
        setLastUpdated(new Date(projectsData.timestamp).toLocaleString("ko-KR"))
      }

      // Supabase에서 가져온 데이터는 이미 올바른 형식이므로 간단히 매핑
      const processedData = projectsData.results.map((item: any) => {
        // 타임스탬프 형식의 ID를 처리
        let title = item.title || "제목 없음"

        // 타이틀이 숫자나 타임스탬프 형식이면 "프로젝트"라는 접두사 추가
        if (/^\d+$/.test(title) || /^\d{4}-\d{2}-\d{2}T/.test(title)) {
          title = `프로젝트 ${title}`
        }

        // 회사명 정규화
        let company = item.company || "-"

        // GS E&R 관련 회사명 통합
        if (company.includes("GS E&R") || company.includes("GS동해전력") || company.includes("포천그린에너지")) {
          company = "GS E&R"
        }

        return {
          id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
          created_at: formatDate(item.created_at) || "-",
          status: item.status || "미정",
          stage: item.stage || "-",
          pm: item.pm || "-",
          company: company,
          title: title,
          training: Boolean(item.training),
          stakeholder: item.stakeholder || "-",
          project_doc: item.project_doc || "",
          genai: Boolean(item.genai),
          digital_output: Boolean(item.digital_output),
          expected_schedule: formatDate(item.expected_schedule) || "-",
        }
      })
      setProjects(processedData)
    } catch (error) {
      console.error("프로젝트 데이터 처리 오류:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [projectsData])

  // refreshData 함수도 동일하게 수정
  const refreshData = async () => {
    try {
      setRefreshing(true)
      console.log("프로젝트 데이터 새로고침 시작...")

      // 캐시를 무효화하기 위한 타임스탬프 추가
      const timestamp = new Date().getTime()
      const freshData = await fetchProjectsData({
        forceRefresh: true,
      })

      console.log("서버에서 받은 데이터:", freshData)

      if (freshData && freshData.results) {
        // 타임스탬프 업데이트
        if (freshData.timestamp) {
          setLastUpdated(new Date(freshData.timestamp).toLocaleString("ko-KR"))
        } else {
          setLastUpdated(new Date().toLocaleString("ko-KR"))
        }

        const processedData = freshData.results.map((item: any) => {
          // 타임스탬프 형식의 ID를 처리
          let title = item.title || "제목 없음"

          // 타이틀이 숫자나 타임스탬프 형식이면 "프로젝트"라는 접두사 추가
          if (/^\d+$/.test(title) || /^\d{4}-\d{2}-\d{2}T/.test(title)) {
            title = `프로젝트 ${title}`
          }

          // 회사명 정규화
          let company = item.company || "-"

          // GS E&R 관련 회사명 통합
          if (company.includes("GS E&R") || company.includes("GS동해전력") || company.includes("포천그린에너지")) {
            company = "GS E&R"
          }

          return {
            id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
            created_at: formatDate(item.created_at) || "-",
            status: item.status || "미정",
            stage: item.stage || "-",
            pm: item.pm || "-",
            company: company,
            title: title,
            training: Boolean(item.training),
            stakeholder: item.stakeholder || "-",
            project_doc: item.project_doc || "",
            genai: Boolean(item.genai),
            digital_output: Boolean(item.digital_output),
            expected_schedule: formatDate(item.expected_schedule) || "-",
          }
        })

        console.log("처리된 데이터:", processedData.length, "개의 프로젝트")

        // 데이터 업데이트
        setProjects(processedData)

        // 필터링 조건 재적용을 위해 상태 업데이트 트리거
        // 검색어가 있는 경우 유지
        if (searchTerm) {
          console.log(`검색어 "${searchTerm}"로 필터링 재적용`)
          // 검색어를 잠시 비웠다가 다시 설정하여 필터링 트리거
          setSearchTerm((prev) => {
            setTimeout(() => setSearchTerm(prev), 10)
            return prev
          })
        }

        // 새로고침 성공 메시지 표시
        console.log(`데이터가 성공적으로 새로고침되었습니다. ${processedData.length}개의 프로젝트가 로드되었습니다.`)
      } else {
        console.error("유효한 데이터를 받지 못했습니다:", freshData)
        alert("데이터를 가져오는 데 문제가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("데이터 새로고침 오류:", error)
      alert(`데이터 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRefreshing(false)
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString: string | null): string {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch (error) {
      return dateString
    }
  }

  // 정렬 처리 함수
  const requestSort = (key: keyof ProjectItem) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // 정렬된 데이터 가져오기
  const getSortedProjects = () => {
    const filteredProjects = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.pm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.stage.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (!sortConfig.key) return filteredProjects

    return [...filteredProjects].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // getProjectStats 함수를 수정하여 프로젝트 목록도 반환하도록 변경
  const getProjectStats = () => {
    // 전체 프로젝트 수
    const totalProjects = projects.length

    // 기획 단계 프로젝트 필터링
    const planningProjectsList = projects.filter(
      (project) =>
        project.stage.includes("진행후보") || project.stage.includes("진행보류") || project.stage.includes("진행확정"),
    )
    const planningProjects = planningProjectsList.length

    // 진행 중인 프로젝트 필터링
    const inProgressProjectsList = projects.filter(
      (project) =>
        project.stage.includes("개발") ||
        project.stage.includes("Development") ||
        project.stage.includes("진행중") ||
        project.stage.includes("테스트") ||
        project.stage.includes("Testing"),
    )
    const inProgressProjects = inProgressProjectsList.length

    // 완료된 프로젝트 필터링 - 정확한 일치 조건으로 변경
    const completedProjectsList = projects.filter((project) => project.stage === "진행완료")
    const completedProjects = completedProjectsList.length

    // 진행완료 데이터 확인을 위한 콘솔 로그 추가
    console.log(
      "모든 프로젝트 단계:",
      projects.map((p) => p.stage),
    )
    console.log("진행완료로 필터링된 프로젝트:", completedProjectsList)

    return {
      totalProjects,
      planningProjects,
      planningProjectsList,
      inProgressProjects,
      inProgressProjectsList,
      completedProjects,
      completedProjectsList,
    }
  }

  // 프로젝트 통계 데이터를 useMemo로 계산 (컴포넌트 시작 부분에 추가)
  const projectStats = useMemo(() => getProjectStats(), [projects])

  // 프로젝트 단계별 분포 데이터 계산 함수
  const getProjectStageDistribution = () => {
    // projectStats에서 계산된 데이터 사용
    const stats = getProjectStats()

    // 단계별 카운트를 저장할 객체 - 세 가지 카테고리로 단순화
    const stageCounts: Record<string, number> = {
      "진행후보/확정": stats.planningProjects,
      진행중: stats.inProgressProjects,
      진행완료: stats.completedProjects,
    }

    // 전체 프로젝트 수
    const total = projects.length

    // 차트 데이터 형식으로 변환
    const chartData = Object.entries(stageCounts)
      .map(([name, value]) => {
        // 각 카테고리별 색상 지정
        let color = "#e9e9e9"
        if (name === "진행후보/확정")
          color = "#fff2c4" // 연한 노란색
        else if (name === "진행중")
          color = "#c5e8ff" // 연한 파란색
        else if (name === "진행완료") color = "#e1f5c4" // 연한 녹색

        return {
          name,
          value,
          percentage: Math.round((value / total) * 100),
          color,
        }
      })
      .sort((a, b) => {
        // 특정 순서로 정렬 (진행후보/확정, 진행중, 진행완료)
        const order = { "진행후보/확정": 1, 진행중: 2, 진행완료: 3 }
        return order[a.name as keyof typeof order] - order[b.name as keyof typeof order]
      })

    return chartData
  }

  // 상태에 따른 배지 색상 결정
  const getStatusBadge = (status: string) => {
    if (status.includes("진행") || status.includes("시작") || status.includes("In Progress")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.includes("완료") || status.includes("종료") || status.includes("Done")) {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (
      status.includes("대기") ||
      status.includes("준비") ||
      status.includes("To Do") ||
      status.includes("계획")
    ) {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.includes("중단") || status.includes("취소") || status.includes("Canceled")) {
      return <Badge className="bg-[#ffd6e0] text-[#c44f6a] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{status}</Badge>
    }
  }

  // 스테이지에 따른 배지 색상 결정
  const getStageBadge = (stage: string) => {
    if (stage.includes("기획") || stage.includes("Planning")) {
      return <Badge className="bg-[#d8d9f8] text-[#5151d3] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("개발") || stage.includes("Development")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("테스트") || stage.includes("Testing")) {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("배포") || stage.includes("Deployment")) {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("유지보수") || stage.includes("Maintenance")) {
      return <Badge className="bg-[#f9e0c3] text-[#c44f6a] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
  }

  // 불리언 값 표시 함수
  const renderBoolean = (value: boolean) => {
    return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-300" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
      </div>
    )
  }

  // 데이터가 없을 때 표시할 메시지 추가
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <div className="mb-4">
            <Database className="h-12 w-12 text-[#e9e9f2] mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-[#4b4b63] mb-2">프로젝트 데이터가 없습니다</h3>
          <p className="text-[#6e6e85] max-w-md mx-auto mb-6">
            Supabase 데이터베이스에 프로젝트 데이터가 없습니다. Supabase 대시보드에서 데이터를 추가하거나 SQL 스크립트를
            실행하여 샘플 데이터를 생성할 수 있습니다.
          </p>
          <Button
            onClick={refreshData}
            variant="outline"
            className="border-[#e9e9f2] text-[#6e6e85] hover:text-[#4b4b63] bg-[#f8f8fc] hover:bg-[#f0f0f8]"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "업데이트 중..." : "업데이트"}
          </Button>
        </div>
      </div>
    )
  }

  // resetData 함수 추가
  // const cleanData = async () => {
  //   if (!confirm("테스트 데이터를 모두 삭제하고 최신 데이터로 업데이트하시겠습니까?")) {
  //   return
  //   }

  //   try {
  //     setRefreshing(true)

  //     // 테스트 데이터 삭제 API 호출
  //     const response = await fetch("/api/clean-projects", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.error || "데이터 정리 실패")
  //     }

  //     const result = await response.json()

  //     // 성공 메시지
  //     alert(`${result.message} 현재 ${result.count}개의 프로젝트가 있습니다.`)

  //     // 받아온 최신 데이터로 상태 업데이트
  //     if (result.data) {
  //       const processedData = result.data.map((item: any) => {
  //         let title = item.title || "제목 없음"
  //         if (/^\d+$/.test(title) || /^\d{4}-\d{2}-\d{2}T/.test(title)) {
  //           title = `프로젝트 ${title}`
  //         }

  //         return {
  //           id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
  //           created_at: formatDate(item.created_at) || "-",
  //           status: item.status || "미정",
  //           stage: item.stage || "-",
  //           pm: item.pm || "-",
  //           company: item.company || "-",
  //           title: title,
  //           training: Boolean(item.training),
  //           stakeholder: item.stakeholder || "-",
  //           project_doc: item.project_doc || "",
  //           genai: Boolean(item.genai),
  //           digital_output: Boolean(item.digital_output),
  //           expected_schedule: formatDate(item.expected_schedule) || "-",
  //         }
  //       })

  //       setProjects(processedData)
  //       setLastUpdated(new Date().toLocaleString("ko-KR"))
  //     } else {
  //       // 데이터가 없으면 새로고침
  //       await refreshData()
  //     }
  //   } catch (error) {
  //     console.error("데이터 정리 오류:", error)
  //     alert(`데이터 정리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)

  //     // 오류 발생 시에도 새로고침 시도
  //     await refreshData()
  //   } finally {
  //     setRefreshing(false)
  //   }
  // }

  // 프로젝트 단계 분포 데이터 가져오기
  const stageDistributionData = getProjectStageDistribution()

  return (
    <div className="space-y-6">
      {/* 프로젝트 현황 요약 카드 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="rounded-full bg-[#f0f0ff] p-3 mr-4">
            <BarChart3 className="h-6 w-6 text-[#7b7bf7]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">전체 프로젝트</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.totalProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => setShowPlanningProjects(!showPlanningProjects)}
        >
          <div className="rounded-full bg-[#fff2c4] bg-opacity-50 p-3 mr-4">
            <Clock className="h-6 w-6 text-[#a17f22]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행후보/확정</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.planningProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => setShowInProgressProjects(!showInProgressProjects)}
        >
          <div className="rounded-full bg-[#c5e8ff] bg-opacity-50 p-3 mr-4">
            <ListChecks className="h-6 w-6 text-[#3a6ea5]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행중</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.inProgressProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => {
            // 모든 프로젝트의 stage 값을 출력하여 확인
            console.log(
              "모든 프로젝트의 stage 값:",
              projects.map((p) => p.stage),
            )

            // 진행완료로 필터링된 프로젝트 목록
            console.log("진행완료로 필터링된 프로젝트:", projectStats.completedProjectsList)

            // 진행완료 필터링 조건 확인
            console.log("진행완료 필터링 조건이 변경되었습니다 - 정확한 일치 조건 적용")

            // 차트 데이터와 비교
            const chartData = getProjectStageDistribution()
            const completedChartData = chartData.find((item) => item.name === "진행완료")
            console.log("진행완료 카드 데이터:", projectStats.completedProjects, "개")
            console.log("진행완료 차트 데이터:", completedChartData?.value, "개")

            setShowCompletedProjects(!showCompletedProjects)
          }}
        >
          <div className="rounded-full bg-[#e1f5c4] bg-opacity-50 p-3 mr-4">
            <CheckCircle2 className="h-6 w-6 text-[#5a7052]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행완료</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.completedProjects}개</p>
          </div>
        </div>
      </div> */}

      {/* {showPlanningProjects && projectStats.planningProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-[#a17f22] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행후보/확정 프로젝트 목록 ({projectStats.planningProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.planningProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showInProgressProjects && projectStats.inProgressProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <ListChecks className="h-5 w-5 text-[#3a6ea5] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행 중인 프로젝트 목록 ({projectStats.inProgressProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.inProgressProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCompletedProjects && projectStats.completedProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#5a7052] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행완료 프로젝트 목록 ({projectStats.completedProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.completedProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {/* 프로젝트 단계별 분포 차트 */}
      {/* <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <PieChart className="h-6 w-6 text-[#a5a6f6] mr-2" />
          <h2 className="text-xl font-bold text-[#2d2d3d]">프로젝트 단계별 분포</h2>
        </div>
        <ProjectStageChart data={stageDistributionData} />
      </div> */}

      {/* 기존 프로젝트 리스트 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0f0f5]">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#a5a6f6]" />
              <Input
                placeholder="프로젝트 검색..."
                className="pl-10 border-[#e9e9f2] bg-[#f8f8fc] focus:bg-white transition-colors rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-[#6e6e85]"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 border-[#e9e9f2] text-[#6e6e85] hover:text-[#4b4b63] bg-[#f8f8fc] hover:bg-[#f0f0f8] rounded-lg"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    필터
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                  <DropdownMenuItem onClick={() => setSearchTerm("진행")} className="cursor-pointer">
                    진행 중인 프로젝트
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("완료")} className="cursor-pointer">
                    완료된 프로젝트
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("기획")} className="cursor-pointer">
                    기획 단계 프로젝트
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f8fc] hover:bg-[#f8f8fc]">
                <TableHead className="w-[250px] font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("title")}>
                    프로젝트명
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "title" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("status")}>
                    상태
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "status" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("stage")}>
                    단계
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "stage" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("pm")}>
                    PM
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "pm" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("company")}>
                    회사
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "company" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("stakeholder")}>
                    이해관계자
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "stakeholder" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => requestSort("training")}
                  >
                    교육
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div className="flex items-center justify-center cursor-pointer" onClick={() => requestSort("genai")}>
                    생성형 AI
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => requestSort("digital_output")}
                  >
                    디지털 산출물
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("expected_schedule")}>
                    <Calendar className="h-4 w-4 mr-1" />
                    예상 일정
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "expected_schedule" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedProjects().length > 0 ? (
                getSortedProjects().map((project) => (
                  <TableRow key={project.id} className="group hover:bg-[#f8f8fc] transition-colors">
                    <TableCell className="font-medium text-[#2d2d3d]">{project.title}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{getStageBadge(project.stage)}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.pm}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.company}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.stakeholder}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.training)}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.genai)}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.digital_output)}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.expected_schedule}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4 text-[#a5a6f6]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2 text-[#a5a6f6]" />
                            상세 정보
                          </DropdownMenuItem>
                          {project.project_doc && (
                            <DropdownMenuItem className="cursor-pointer">
                              <a
                                href={project.project_doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full"
                              >
                                프로젝트 문서
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-[#6e6e85]">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-5 border-t border-[#f0f0f5] text-sm text-[#6e6e85] bg-[#f8f8fc]">
          총 {getSortedProjects().length}개 프로젝트 (전체 {projects.length}개 중)
          {lastUpdated && <span className="ml-4">최근 업데이트: {lastUpdated}</span>}
        </div>
      </div>
    </div>
  )
}
