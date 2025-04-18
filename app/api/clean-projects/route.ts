import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("프로젝트 데이터 정리 시작...")

    // 1. 먼저 삭제할 레코드를 조회하여 개수 파악
    const { data: recordsToDelete, error: countError } = await supabase
      .from("project_list")
      .select("id")
      .or(
        "title.ilike.1743%,title.ilike.2025-%,title.ilike.%T%:%Z,title.ilike.%test%,title.ilike.%테스트%,title.eq.null,title.eq.",
      )

    if (countError) {
      console.error("삭제할 레코드 조회 오류:", countError)
      return NextResponse.json(
        {
          error: `삭제할 레코드 조회 오류: ${countError.message}`,
          code: countError.code,
        },
        { status: 500 },
      )
    }

    const deleteCount = recordsToDelete ? recordsToDelete.length : 0
    console.log(`삭제할 테스트 데이터 수: ${deleteCount}개`)

    // 2. 삭제할 레코드가 있는 경우에만 삭제 수행
    if (deleteCount > 0) {
      const { error: deleteError } = await supabase
        .from("project_list")
        .delete()
        .or(
          "title.ilike.1743%,title.ilike.2025-%,title.ilike.%T%:%Z,title.ilike.%test%,title.ilike.%테스트%,title.eq.null,title.eq.",
        )

      if (deleteError) {
        console.error("데이터 삭제 오류:", deleteError)
        return NextResponse.json(
          {
            error: `데이터 삭제 오류: ${deleteError.message}`,
            code: deleteError.code,
          },
          { status: 500 },
        )
      }
    }

    // 3. 최신 데이터 가져오기
    const { data: freshData, error: fetchError } = await supabase
      .from("project_list")
      .select("*")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("최신 데이터 가져오기 오류:", fetchError)
      return NextResponse.json(
        {
          error: `최신 데이터 가져오기 오류: ${fetchError.message}`,
          code: fetchError.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `${deleteCount}개의 테스트 프로젝트가 성공적으로 정리되었습니다.`,
      data: freshData,
      count: freshData?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("프로젝트 데이터 정리 오류:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
