import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Supabase 설정 확인 시작...")

    // products 테이블 존재 여부 확인
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("products")
      .select("count")
      .limit(1)
      .catch(() => ({ data: null, error: { message: "Table does not exist" } }))

    // 테이블이 없으면 생성 시도
    if (tableCheckError) {
      console.log("products 테이블이 없습니다. 테이블 생성을 시도합니다...")

      // SQL을 통한 테이블 생성은 여기서 직접 할 수 없으므로 안내만 제공
      return NextResponse.json({
        status: "table_not_found",
        message: "products 테이블이 존재하지 않습니다. Supabase 대시보드에서 테이블을 생성해주세요.",
        requiredColumns: [
          { name: "id", type: "uuid", isPrimary: true },
          { name: "title", type: "text" },
          { name: "thumbnail_url", type: "text" },
          { name: "short_desc", type: "text" },
          { name: "description", type: "text" },
          { name: "usage_period", type: "text" },
          { name: "company", type: "text" },
          { name: "service_url", type: "text" },
        ],
        sqlExample: `
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
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
  ('디지털 서비스 대시보드', '/placeholder.svg?height=300&width=400', '조직의 디지털 서비스 현황을 한눈에 볼 수 있는 대시보드', '상세 설명...', '2022~2023', '52g', 'https://example.com/dashboard'),
  ('모바일 앱 서비스', '/placeholder.svg?height=300&width=400', '사용자 친화적인 모바일 앱 서비스', '상세 설명...', '2021~현재', '파트너사', 'https://example.com/mobile-app');
`,
      })
    }

    // 테이블이 있으면 컬럼 정보 확인
    const { data: columns, error: columnsError } = await supabase
      .rpc("get_table_info", { table_name: "products" })
      .catch(() => ({ data: null, error: { message: "Cannot get table info" } }))

    if (columnsError) {
      console.error("테이블 정보를 가져오는 중 오류 발생:", columnsError)
      return NextResponse.json({
        status: "table_info_error",
        message: "테이블 정보를 가져올 수 없습니다.",
        error: columnsError,
      })
    }

    // 데이터 샘플 가져오기
    const { data: sampleData, error: sampleError } = await supabase.from("products").select("*").limit(1)

    return NextResponse.json({
      status: "success",
      message: "products 테이블이 존재합니다.",
      tableInfo: {
        columns,
        hasSampleData: sampleData && sampleData.length > 0,
      },
      sampleData: sampleData && sampleData.length > 0 ? sampleData[0] : null,
    })
  } catch (error) {
    console.error("Supabase 설정 확인 중 오류:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "설정 확인 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
