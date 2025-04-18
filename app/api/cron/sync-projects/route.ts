import { NextResponse } from "next/server"
import { fetchProjectsData } from "@/app/actions/projects"

// Vercel Cron Job을 위한 설정
export const dynamic = "force-dynamic"
export const revalidate = 0

// 이 API는 Vercel Cron에 의해 매일 오전 9시에 호출됩니다
export async function GET(request: Request) {
  try {
    console.log("자동 동기화 작업 시작:", new Date().toISOString())

    // 프로젝트 데이터 강제 새로고침
    const result = await fetchProjectsData({ forceRefresh: true })

    // 동기화 결과 로깅
    console.log(`동기화 완료: ${result.count || 0}개의 프로젝트 데이터 업데이트됨`)

    return NextResponse.json({
      success: true,
      message: `프로젝트 데이터 동기화 완료 (${result.count || 0}개 프로젝트)`,
      timestamp: new Date().toISOString(),
      data: {
        count: result.count || 0,
        refreshed: result.refreshed || false,
      },
    })
  } catch (error) {
    console.error("자동 동기화 작업 오류:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
