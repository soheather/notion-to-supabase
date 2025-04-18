import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API 테스트 성공",
    timestamp: new Date().toISOString(),
  })
}
