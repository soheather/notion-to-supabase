import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateWeeklyReport, saveWeeklyReport } from "@/lib/report-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    console.log("수동 리포트 생성 작업 시작:", new Date().toISOString())

    // 현재 프로젝트 데이터 가져오기
    const { data: currentProjects, error } = await supabase
      .from("project_list")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`프로젝트 데이터 가져오기 오류: ${error.message}`)
    }

    if (!currentProjects || currentProjects.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "프로젝트 데이터가 없습니다. 먼저 프로젝트를 추가해주세요.",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // 이전 리포트 삭제 (오늘 날짜의 리포트가 이미 있는 경우)
    const today = new Date().toISOString().split("T")[0]
    const { error: deleteError } = await supabase.from("project_reports").delete().eq("report_date", today)

    if (deleteError) {
      console.warn(`기존 리포트 삭제 오류: ${deleteError.message}`)
    }

    // 주간 리포트 생성 (이전 데이터 없이)
    const report = generateWeeklyReport(currentProjects, [])

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
      message: "오늘 날짜 기준으로 리포트가 성공적으로 생성되었습니다.",
      timestamp: new Date().toISOString(),
      reportSummary: {
        newProjects: report.newProjects.length,
        reportDate: report.reportDate,
      },
    })
  } catch (error) {
    console.error("리포트 생성 오류:", error)

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
