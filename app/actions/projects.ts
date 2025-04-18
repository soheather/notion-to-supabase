"use server"

import { supabase } from "@/lib/supabase"
import { fetchWithCache } from "@/lib/cache-utils"

// 캐시 키
const PROJECTS_CACHE_KEY = "projects-data"

// fetchProjectsData 함수를 개선합니다.
// 1. 캐시 무효화 로직 강화
// 2. 로깅 개선

// fetchProjectsData 함수 부분만 수정합니다.
export async function fetchProjectsData(options?: { forceRefresh?: boolean }) {
  // 기본적으로 강제 새로고침 옵션을 true로 설정하여 항상 최신 데이터를 가져오도록 함
  const { forceRefresh = true } = options || {}

  console.log(`fetchProjectsData 호출됨 (forceRefresh: ${forceRefresh})`)

  return fetchWithCache(
    PROJECTS_CACHE_KEY,
    async () => {
      try {
        console.log("Supabase 프로젝트 데이터 가져오기 시작...")

        // 현재 시간 기준으로 타임스탬프 생성
        const timestamp = new Date().toISOString()

        // 캐시 무효화를 위한 쿼리 파라미터 추가
        const cacheParam = `?t=${Date.now()}`

        // Supabase에서 프로젝트 데이터 가져오기
        const { data, error } = await supabase
          .from("project_list")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Supabase 프로젝트 데이터 가져오기 오류:", error)
          return {
            results: [],
            error: `Supabase 오류: ${error.message}`,
            timestamp,
            refreshed: true,
          }
        }

        console.log(`${data?.length || 0}개의 프로젝트 데이터를 성공적으로 가져왔습니다`)

        // 실제 데이터만 반환
        return {
          results: data || [],
          count: data?.length || 0,
          timestamp,
          refreshed: true,
        }
      } catch (error) {
        console.error("fetchProjectsData 오류:", error)
        return {
          results: [],
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          refreshed: false,
        }
      }
    },
    { forceRefresh, expiryMs: 0 }, // 캐시 만료 시간을 0으로 설정하여 항상 새로고침
  )
}

// 테이블 존재 여부 확인 함수
export async function checkProjectsTable() {
  try {
    // 테이블 존재 여부 확인을 위한 간단한 쿼리
    const { data, error } = await supabase.from("project_list").select("id").limit(1)

    if (error && error.code === "PGRST116") {
      // PGRST116: 테이블이 존재하지 않음
      return {
        exists: false,
        error: "project_list 테이블이 존재하지 않습니다.",
      }
    }

    return {
      exists: true,
      count: data?.length || 0,
    }
  } catch (error) {
    console.error("프로젝트 테이블 확인 오류:", error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// 테이블 생성 SQL을 반환하는 함수로 변경
export async function getCreateProjectsTableSQL() {
  return `
CREATE TABLE project_list (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
 status TEXT,
 stage TEXT,
 pm TEXT,
 company TEXT,
 title TEXT,
 training BOOLEAN DEFAULT false,
 stakeholder TEXT,
 project_doc TEXT,
 genai BOOLEAN DEFAULT false,
 digital_output BOOLEAN DEFAULT false,
 expected_schedule DATE
);
`
}
