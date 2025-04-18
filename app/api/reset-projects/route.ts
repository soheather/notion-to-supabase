import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCreateProjectsTableSQL } from "@/app/actions/projects"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("프로젝트 데이터 초기화 시작...")

    // 기존 테이블 삭제
    const { error: dropError } = await supabase.rpc("drop_table_if_exists", { table_name: "project_list" })

    if (dropError) {
      console.error("테이블 삭제 오류:", dropError)
      return NextResponse.json(
        {
          error: `테이블 삭제 오류: ${dropError.message}`,
          code: dropError.code,
        },
        { status: 500 },
      )
    }

    // SQL 스크립트 가져오기
    const createTableSQL = await getCreateProjectsTableSQL()

    // SQL 스크립트에서 CREATE TABLE 부분만 추출
    const createTableSQLPart = createTableSQL.split(";")[0] + ";"

    // 새 테이블 생성
    const { error: createError } = await supabase.rpc("execute_sql", { sql_query: createTableSQLPart })

    if (createError) {
      console.error("테이블 생성 오류:", createError)
      return NextResponse.json(
        {
          error: `테이블 생성 오류: ${createError.message}`,
          code: createError.code,
        },
        { status: 500 },
      )
    }

    // 샘플 데이터 추가
    const sampleData = [
      {
        title: "AI 기반 고객 분석 시스템",
        status: "진행중",
        stage: "개발",
        pm: "김프로",
        company: "GS E&R",
        stakeholder: "마케팅팀",
        training: true,
        genai: true,
        digital_output: true,
        expected_schedule: new Date("2023-12-31").toISOString(),
        project_doc: "https://docs.example.com/ai-customer-analysis",
      },
      {
        title: "모바일 앱 리뉴얼 프로젝트",
        status: "계획",
        stage: "기획",
        pm: "이매니저",
        company: "파트너사",
        stakeholder: "서비스팀",
        training: false,
        genai: false,
        digital_output: true,
        expected_schedule: new Date("2024-06-15").toISOString(),
        project_doc: "https://docs.example.com/mobile-app-renewal",
      },
      {
        title: "데이터 분석 플랫폼 구축",
        status: "진행중",
        stage: "개발",
        pm: "박담당",
        company: "사내IT팀",
        stakeholder: "데이터팀",
        training: true,
        genai: true,
        digital_output: true,
        expected_schedule: new Date("2024-08-10").toISOString(),
        project_doc: "https://docs.example.com/data-analytics-platform",
      },
      {
        title: "클라우드 마이그레이션",
        status: "진행중",
        stage: "테스트",
        pm: "최개발",
        company: "GS E&R",
        stakeholder: "인프라팀",
        training: false,
        genai: false,
        digital_output: true,
        expected_schedule: new Date("2024-05-20").toISOString(),
        project_doc: "",
      },
      {
        title: "직원 교육 시스템 개발",
        status: "완료",
        stage: "유지보수",
        pm: "정분석",
        company: "파트너사",
        stakeholder: "인사팀",
        training: true,
        genai: false,
        digital_output: true,
        expected_schedule: new Date("2023-11-30").toISOString(),
        project_doc: "https://docs.example.com/employee-training-system",
      },
    ]

    // 데이터 삽입
    const { error: insertError } = await supabase.from("project_list").insert(sampleData)

    if (insertError) {
      console.error("데이터 삽입 오류:", insertError)
      return NextResponse.json(
        {
          error: `데이터 삽입 오류: ${insertError.message}`,
          code: insertError.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "프로젝트 데이터가 성공적으로 초기화되었습니다.",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("프로젝트 데이터 초기화 오류:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
