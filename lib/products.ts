import { supabase } from "@/lib/supabase"

export interface Product {
  id: string
  title: string
  thumbnail_url: string
  short_desc: string
  description: string
  usage_period: string
  company: string
  service_url: string
}

export interface ProductsResponse {
  products: Product[]
  count?: number
  error?: string
  code?: string
  createTableSQL?: string
  useMockData?: boolean
}

// 목업 제품 데이터 - 연결 실패 시 폴백으로 사용
const mockProducts: Product[] = [
  {
    id: "1",
    title: "디지털 서비스 대시보드",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "조직의 디지털 서비스 현황을 한눈에 볼 수 있는 대시보드",
    description: "조직의 디지털 서비스 현황을 실시간으로 모니터링하고 관리할 수 있는 대시보드입니다.",
    usage_period: "2022~2023",
    company: "52g",
    service_url: "https://example.com/dashboard",
  },
  {
    id: "2",
    title: "모바일 앱 서비스",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "사용자 친화적인 모바일 앱 서비스",
    description: "사용자 경험을 최우선으로 고려한 모바일 앱 서비스입니다.",
    usage_period: "2021~현재",
    company: "파트너사",
    service_url: "https://example.com/mobile-app",
  },
  {
    id: "3",
    title: "데이터 분석 플랫폼",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "빅데이터 기반 분석 플랫폼",
    description: "대용량 데이터를 실시간으로 분석하고 인사이트를 제공하는 플랫폼입니다.",
    usage_period: "2023~현재",
    company: "사내IT팀",
    service_url: "https://example.com/data-analytics",
  },
]

// 서버 사이드에서 제품 데이터 가져오기
export async function getProducts(): Promise<ProductsResponse> {
  try {
    console.log("서버 사이드에서 제품 데이터 가져오기 시작...")

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase 환경 변수가 설정되지 않았습니다. 목업 데이터를 사용합니다.")
      return {
        products: mockProducts,
        count: mockProducts.length,
        error: "Supabase 환경 변수가 설정되지 않았습니다.",
        useMockData: true,
      }
    }

    // Supabase 연결 시도
    try {
      // 테이블 이름을 "products"로 변경 (이전에는 "page"였음)
      const { data, error, status } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      // 에러 처리
      if (error) {
        console.error("Supabase 데이터 가져오기 오류:", error)

        // 테이블이 없는 경우
        if (error.message && error.message.includes("does not exist")) {
          console.log("products 테이블이 존재하지 않습니다. 목업 데이터를 사용합니다.")
          return {
            products: mockProducts,
            error: "Supabase 데이터베이스에 products 테이블이 존재하지 않습니다.",
            code: "TABLE_NOT_EXIST",
            createTableSQL: getCreateTableSQL(),
            useMockData: true,
          }
        }

        // 기타 오류 - 목업 데이터로 폴백
        console.log("Supabase 오류 발생. 목업 데이터를 사용합니다.")
        return {
          products: mockProducts,
          error: `Supabase 오류: ${error.message}`,
          code: error.code,
          useMockData: true,
        }
      }

      // 데이터가 없는 경우
      if (!data || data.length === 0) {
        console.log("제품 데이터가 없습니다. 목업 데이터를 사용합니다.")
        return {
          products: mockProducts,
          count: mockProducts.length,
          useMockData: true,
        }
      }

      console.log(`${data.length}개의 제품 데이터를 성공적으로 가져왔습니다`)
      return {
        products: data,
        count: data.length,
        useMockData: false,
      }
    } catch (fetchError) {
      console.error("Supabase 데이터 가져오기 중 예외 발생:", fetchError)
      console.log("목업 데이터로 폴백합니다.")

      return {
        products: mockProducts,
        error: `Supabase 데이터 가져오기 중 오류 발생: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        code: "FETCH_ERROR",
        useMockData: true,
      }
    }
  } catch (error) {
    console.error("제품 데이터 가져오기 예외:", error)

    // 모든 오류 상황에서 목업 데이터로 폴백
    return {
      products: mockProducts,
      error: `데이터 가져오기 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
      code: "EXCEPTION",
      useMockData: true,
    }
  }
}

// 테이블 생성 SQL 스크립트 반환
function getCreateTableSQL(): string {
  return `
CREATE TABLE products (
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
INSERT INTO products (title, thumbnail_url, short_desc, description, usage_period, company, service_url)
VALUES 
('디지털 서비스 대시보드', '/placeholder.svg?height=300&width=400', '조직의 디지털 서비스 현황을 한눈에 볼 수 있는 대시보드', '조직의 디지털 서비스 현황을 실시간으로 모니터링하고 관리할 수 있는 대시보드입니다.', '2022~2023', '52g', 'https://example.com/dashboard'),
('모바일 앱 서비스', '/placeholder.svg?height=300&width=400', '사용자 친화적인 모바일 앱 서비스', '사용자 경험을 최우선으로 고려한 모바일 앱 서비스입니다.', '2021~현재', '파트너사', 'https://example.com/mobile-app'),
('데이터 분석 플랫폼', '/placeholder.svg?height=300&width=400', '빅데이터 기반 분석 플랫폼', '대용량 데이터를 실시간으로 분석하고 인사이트를 제공하는 플랫폼입니다.', '2023~현재', '사내IT팀', 'https://example.com/data-analytics');
`
}
