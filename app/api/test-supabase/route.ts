import { NextResponse } from "next/server"
import { testSupabaseConnection } from "@/lib/supabase"

export async function GET() {
  try {
    // Supabase 연결 테스트
    const connectionResult = await testSupabaseConnection()

    // 환경 변수 정보 (보안을 위해 일부만 표시)
    const envInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 8)}...`
        : "Not set",
      supabaseKeySet: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes (hidden)" : "No",
    }

    return NextResponse.json({
      connection: connectionResult,
      environment: envInfo,
    })
  } catch (error) {
    console.error("Test Supabase API error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
