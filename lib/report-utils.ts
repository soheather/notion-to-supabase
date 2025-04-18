// 기존 import 문을 수정합니다
import { supabase } from "@/lib/supabase"

export interface Project {
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
  [key: string]: any // Allow access to any property
}

export interface ProjectChange {
  field: string
  oldValue: any
  newValue: any
}

export interface ChangedProject {
  id: string
  title: string
  changes: ProjectChange[]
}

export interface WeeklyReport {
  reportDate: string
  generatedAt: string
  changedProjects: ChangedProject[]
  newProjects: Project[]
  previousSnapshotDate: string | null
  id?: string
}

export function getFieldDisplayName(field: string): string {
  switch (field) {
    case "status":
      return "상태"
    case "stage":
      return "단계"
    case "pm":
      return "PM"
    case "company":
      return "회사"
    case "title":
      return "프로젝트명"
    case "training":
      return "교육"
    case "stakeholder":
      return "이해관계자"
    case "project_doc":
      return "프로젝트 문서"
    case "genai":
      return "생성형 AI"
    case "digital_output":
      return "디지털 산출물"
    case "expected_schedule":
      return "예상 일정"
    default:
      return field
  }
}

export function formatValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }
  if (value === null || value === undefined) {
    return "-"
  }
  return String(value)
}

// generateWeeklyReport 함수 수정
export function generateWeeklyReport(currentProjects: Project[], previousProjects: Project[]): WeeklyReport {
  const now = new Date()
  const reportDate = now.toISOString().split("T")[0] // YYYY-MM-DD 형식

  // 이전 스냅샷 날짜 확인
  const previousSnapshotDate =
    previousProjects.length > 0 ? new Date(previousProjects[0].created_at).toISOString().split("T")[0] : null

  // 현재 프로젝트 ID 맵 생성
  const currentProjectMap = new Map<string, Project>()
  currentProjects.forEach((project) => {
    currentProjectMap.set(project.id, project)
  })

  // 이전 프로젝트 ID 맵 생성
  const previousProjectMap = new Map<string, Project>()
  previousProjects.forEach((project) => {
    previousProjectMap.set(project.id, project)
  })

  // 변경된 프로젝트 찾기
  const changedProjects: ChangedProject[] = []

  // 기존 프로젝트의 변경 사항 확인
  currentProjectMap.forEach((currentProject, id) => {
    const previousProject = previousProjectMap.get(id)

    // 이전에 존재했던 프로젝트인 경우 변경 사항 확인
    if (previousProject) {
      const changes: ProjectChange[] = []

      // 모든 필드 비교
      Object.keys(currentProject).forEach((field) => {
        // created_at 필드는 제외
        if (field !== "created_at" && field !== "id") {
          const oldValue = previousProject[field]
          const newValue = currentProject[field]

          // 값이 변경된 경우
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
              field,
              oldValue,
              newValue,
            })
          }
        }
      })

      // 변경 사항이 있는 경우 추가
      if (changes.length > 0) {
        changedProjects.push({
          id,
          title: currentProject.title,
          changes,
        })
      }
    }
  })

  // 새로 추가된 프로젝트 찾기
  const newProjects: Project[] = []
  currentProjectMap.forEach((project, id) => {
    if (!previousProjectMap.has(id)) {
      newProjects.push(project)
    }
  })

  return {
    reportDate,
    generatedAt: now.toISOString(),
    changedProjects,
    newProjects,
    previousSnapshotDate,
  }
}

// saveWeeklyReport 함수 수정
export async function saveWeeklyReport(report: WeeklyReport) {
  const { error } = await supabase.from("project_reports").insert({
    report_date: report.reportDate,
    generated_at: report.generatedAt,
    changed_projects: report.changedProjects,
    new_projects: report.newProjects,
    previous_snapshot_date: report.previousSnapshotDate,
  })

  if (error) {
    console.error("리포트 저장 오류:", error)
    throw error
  }

  return true
}

// getLatestWeeklyReport 함수 수정
export async function getLatestWeeklyReport(): Promise<WeeklyReport | null> {
  const { data, error } = await supabase
    .from("project_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)

  if (error) {
    console.error("리포트 가져오기 오류:", error)
    throw error
  }

  if (data && data.length > 0) {
    return {
      id: data[0].id,
      reportDate: data[0].report_date,
      generatedAt: data[0].generated_at,
      changedProjects: data[0].changed_projects,
      newProjects: data[0].new_projects,
      previousSnapshotDate: data[0].previous_snapshot_date,
    }
  }

  return null
}

// getAllWeeklyReports 함수 수정
export async function getAllWeeklyReports(): Promise<{ id: string; reportDate: string }[]> {
  const { data, error } = await supabase
    .from("project_reports")
    .select("id, report_date")
    .order("report_date", { ascending: false })

  if (error) {
    console.error("리포트 목록 가져오기 오류:", error)
    throw error
  }

  return data || []
}

// getWeeklyReportByDate 함수 수정
export async function getWeeklyReportByDate(date: string): Promise<WeeklyReport | null> {
  const { data, error } = await supabase.from("project_reports").select("*").eq("report_date", date).limit(1)

  if (error) {
    console.error("리포트 가져오기 오류:", error)
    throw error
  }

  if (data && data.length > 0) {
    return {
      id: data[0].id,
      reportDate: data[0].report_date,
      generatedAt: data[0].generated_at,
      changedProjects: data[0].changed_projects,
      newProjects: data[0].new_projects,
      previousSnapshotDate: data[0].previous_snapshot_date,
    }
  }

  return null
}
