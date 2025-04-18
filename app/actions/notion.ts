"use server"

import { fetchWithCache } from "@/lib/cache-utils"

// 캐시 키
const NOTION_CACHE_KEY = "notion-data"

export async function fetchNotionData(options?: { forceRefresh?: boolean }) {
  return fetchWithCache(
    NOTION_CACHE_KEY,
    async () => {
      try {
        // 환경 변수 가져오기
        const apiKey = process.env.NOTION_API_KEY
        const databaseId = process.env.NOTION_DATABASE_ID

        // 환경 변수 유효성 검사
        if (!apiKey) {
          console.error("NOTION_API_KEY가 없습니다")
          return { results: [], error: "NOTION_API_KEY가 없습니다" }
        }

        if (!databaseId) {
          console.error("NOTION_DATABASE_ID가 없습니다")
          return { results: [], error: "NOTION_DATABASE_ID가 없습니다" }
        }

        // 키 값에 따옴표나 공백이 있는지 확인
        if (apiKey.includes('"') || apiKey.includes("'") || apiKey.trim() !== apiKey) {
          console.error("NOTION_API_KEY에 따옴표나 불필요한 공백이 포함되어 있습니다")
          return { results: [], error: "NOTION_API_KEY 형식이 올바르지 않습니다" }
        }

        if (databaseId.includes('"') || databaseId.includes("'") || databaseId.trim() !== databaseId) {
          console.error("NOTION_DATABASE_ID에 따옴표나 불필요한 공백이 포함되어 있습니다")
          return { results: [], error: "NOTION_DATABASE_ID 형식이 올바르지 않습니다" }
        }

        console.log("Notion API 호출 시작...")
        console.log(`Database ID: ${databaseId.substring(0, 5)}...`) // 보안을 위해 일부만 로깅

        // Notion API 직접 호출
        const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
          }),
          cache: "no-store", // 항상 최신 데이터 가져오기
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Notion API 오류 (${response.status}):`, errorText)
          return {
            results: [],
            error: `Notion API 오류 (${response.status}): ${errorText}`,
          }
        }

        const data = await response.json()
        console.log("Notion API 호출 성공:", data.results.length, "개의 결과")
        return data
      } catch (error) {
        console.error("fetchNotionData 오류:", error)
        // 오류 발생 시 빈 결과 반환
        return {
          results: [],
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },
    options,
  )
}

