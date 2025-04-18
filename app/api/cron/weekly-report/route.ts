import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateWeeklyReport, saveWeeklyReport } from "@/lib/report-utils"

// Vercel Cron Job을 위한 설정
export const dynamic = "force-dynamic"
export const revalidate = 0

// 이 API는 Vercel Cron에 의해 매주 월요일 오전 8시에 호출됩니다
export async function GET(request: Request) {
  try {
    console.log("주간 리포트 생성 작업 시작:", new Date().toISOString())

    // 현재 프로젝트 데이터 가져오기
    const { data: currentProjects, error } = await supabase
      .from("project_list")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`프로젝트 데이터 가져오기 오류: ${error.message}`)
    }

    // 이전 주 데이터 가져오기 (project_history 테이블에서)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoStr = oneWeekAgo.toISOString()

    const { data: historyData, error: historyError } = await supabase
      .from("project_history")
      .select("*")
      .eq("snapshot_type", "weekly")
      .lt("created_at", oneWeekAgoStr)
      .order("created_at", { ascending: false })
      .limit(1)

    if (historyError) {
      console.warn(`이전 주 데이터 가져오기 오류: ${historyError.message}`)
    }

    const previousProjects = historyData && historyData.length > 0 ? historyData[0].data : []

    // 주간 리포트 생성
    const report = generateWeeklyReport(currentProjects, previousProjects)

    // 현재 데이터를 히스토리에 저장
    const { error: saveError } = await supabase.from("project_history").insert({
      snapshot_type: "weekly",
      data: currentProjects,
      created_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error(`히스토리 저장 오류: ${saveError.message}`)
    }

    // 리포트 저장
    await saveWeeklyReport(report)

    return NextResponse.json({
      success: true,
      message: "주간 리포트가 성공적으로 생성되었습니다.",
      timestamp: new Date().toISOString(),
      reportSummary: {
        changedProjects: report.changedProjects.length,
        newProjects: report.newProjects.length,
        reportDate: report.reportDate,
      },
    })
  } catch (error) {
    console.error("주간 리포트 생성 오류:", error)

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
