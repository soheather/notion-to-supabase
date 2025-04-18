import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 환경 변수 가져오기
    const apiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_DATABASE_ID

    // 환경 변수 유효성 검사
    if (!apiKey) {
      return NextResponse.json({ error: "NOTION_API_KEY가 없습니다" }, { status: 500 })
    }

    if (!databaseId) {
      return NextResponse.json({ error: "NOTION_DATABASE_ID가 없습니다" }, { status: 500 })
    }

    // Notion API 직접 호출
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 10, // 테스트를 위해 10개만 가져옴
      }),
      cache: "no-store", // 항상 최신 데이터 가져오기
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Notion API 오류 (${response.status}): ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Notion API 테스트 오류:", error)
    return NextResponse.json(
      { error: `Notion API 테스트 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

