import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, databaseId } = await request.json()

    // 입력 유효성 검사
    if (!apiKey || !databaseId) {
      return NextResponse.json({ error: "API 키와 데이터베이스 ID가 필요합니다." }, { status: 400 })
    }

    // 환경 변수 파일 경로
    const envFilePath = path.join(process.cwd(), ".env.local")

    // 환경 변수 파일 내용 생성
    const envContent = `NOTION_API_KEY=${apiKey}\nNOTION_DATABASE_ID=${databaseId}\n`

    // 파일에 쓰기
    fs.writeFileSync(envFilePath, envContent, "utf8")

    // 프로세스 환경 변수 업데이트 (현재 실행 중인 프로세스에만 적용됨)
    process.env.NOTION_API_KEY = apiKey
    process.env.NOTION_DATABASE_ID = databaseId

    return NextResponse.json({ success: true, message: "설정이 저장되었습니다." })
  } catch (error) {
    console.error("설정 저장 오류:", error)
    return NextResponse.json(
      { error: `설정 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
