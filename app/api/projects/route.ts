import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCreateProjectsTableSQL } from "@/app/actions/projects"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("프로젝트 API 호출 시작...")

    // 캐시 무효화를 위한 타임스탬프 파라미터 추가
    const timestamp = new Date().toISOString()

    // Supabase에서 프로젝트 데이터 가져오기
    const { data, error } = await supabase.from("project_list").select("*").order("created_at", { ascending: false })

    // 테이블이 없는 경우
    if (error && error.code === "PGRST116") {
      const createTableSQL = await getCreateProjectsTableSQL()

      return NextResponse.json(
        {
          error: "project_list 테이블이 존재하지 않습니다.",
          code: "TABLE_NOT_EXIST",
          createTableSQL,
          timestamp,
          refreshed: true,
        },
        { status: 404 },
      )
    }

    // 다른 오류가 발생한 경우
    if (error) {
      console.error("Supabase 프로젝트 데이터 가져오기 오류:", error)
      return NextResponse.json(
        {
          error: `Supabase 오류: ${error.message}`,
          code: error.code,
          timestamp,
          refreshed: false,
        },
        { status: 500 },
      )
    }

    // 데이터가 없는 경우에도 빈 배열 반환 (테스트 데이터 없음)
    return NextResponse.json({
      results: data || [],
      count: data?.length || 0,
      timestamp,
      refreshed: true,
    })
  } catch (error) {
    console.error("프로젝트 API 예상치 못한 오류:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        refreshed: false,
      },
      { status: 500 },
    )
  }
}
