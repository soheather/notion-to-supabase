import { createClient } from "@supabase/supabase-js"

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 로깅 (개발 환경에서만)
if (process.env.NODE_ENV === "development") {
  console.log("Supabase URL 설정됨:", !!supabaseUrl)
  console.log("Supabase Anon Key 설정됨:", !!supabaseAnonKey)
}

// 환경 변수 유효성 검사
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Make sure you have set the environment variables correctly.")
}

// 서버 컴포넌트에서 사용할 수 있도록 설정 개선
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: false, // SSR에서 문제 방지
    autoRefreshToken: false, // 서버 컴포넌트에서는 불필요
  },
})

// 연결 테스트 함수
export async function testSupabaseConnection() {
  try {
    console.log("Supabase 연결 테스트 시작...")

    // 테이블 이름을 'products'로 변경
    const { data, error, status } = await supabase.from("products").select("count").limit(1)

    console.log("Supabase 응답 상태:", status)

    if (error) {
      // 테이블이 없는 경우 특별히 처리
      if (error.message && error.message.includes("does not exist")) {
        console.log("products 테이블이 존재하지 않습니다.")
        return {
          success: false,
          message: "Table does not exist",
          error,
          isTableNotExist: true,
        }
      }

      console.error("Supabase 연결 테스트 오류:", error)
      throw error
    }

    console.log("Supabase 연결 테스트 성공:", data)
    return {
      success: true,
      message: "Connection successful",
      data,
    }
  } catch (error) {
    console.error("Supabase 연결 테스트 실패:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    }
  }
}

// 테이블 생성 SQL 스크립트 제공
export const createProductsTableSQL = `
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  short_desc TEXT,
  description TEXT,
  usage_period TEXT,
  company TEXT,
  service_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 데이터 추가
INSERT INTO public.products (title, thumbnail_url, short_desc, description, usage_period, company, service_url)
VALUES 
  ('디지털 서비스 대시보드', '/placeholder.svg?height=300&width=400', '조직의 디지털 서비스 현황을 한눈에 볼 수 있는 대시보드', '조직의 디지털 서비스 현황을 실시간으로 모니터링하고 관리할 수 있는 대시보드입니다.', '2022~2023', '52g', 'https://example.com/dashboard'),
  ('모바일 앱 서비스', '/placeholder.svg?height=300&width=400', '사용자 친화적인 모바일 앱 서비스', '사용자 경험을 최우선으로 고려한 모바일 앱 서비스입니다.', '2021~현재', '파트너사', 'https://example.com/mobile-app'),
  ('데이터 분석 플랫폼', '/placeholder.svg?height=300&width=400', '빅데이터 기반 분석 플랫폼', '대용량 데이터를 실시간으로 분석하고 인사이트를 제공하는 플랫폼입니다.', '2023~현재', '사내IT팀', 'https://example.com/data-analytics');
`
