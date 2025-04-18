import { fetchNotionData } from "@/app/actions/notion"
import ServicesList from "@/components/services-list"
import { AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5분마다 재검증

export default async function ServicesPage() {
  try {
    // 서버 컴포넌트에서 Notion 데이터 가져오기
    const notionData = await fetchNotionData()

    // Notion API 오류 확인
    if (notionData?.error) {
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
            </div>
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
                <h3 className="text-[#c44f6a] text-lg font-medium">Notion API 연동 오류</h3>
              </div>
              <p className="text-[#c44f6a] mb-4">{notionData.error}</p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음 사항을 확인해보세요:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    환경 변수 <code className="bg-[#ffc2d1] px-1 rounded">NOTION_API_KEY</code>와{" "}
                    <code className="bg-[#ffc2d1] px-1 rounded">NOTION_DATABASE_ID</code>가 올바르게 설정되었는지
                    확인하세요.
                  </li>
                  <li>키 값에 따옴표나 불필요한 공백이 포함되어 있지 않은지 확인하세요.</li>
                  <li>Notion API 키가 유효하고 데이터베이스에 접근 권한이 있는지 확인하세요.</li>
                  <li>
                    서버를 재시작해보세요 (<code className="bg-[#ffc2d1] px-1 rounded">npm run dev</code>).
                  </li>
                  <li>
                    테스트 엔드포인트(<code className="bg-[#ffc2d1] px-1 rounded">/api/test-notion</code>)에 접속하여
                    자세한 오류 정보를 확인하세요.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      )
    }

    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
          </div>
          <ServicesList notionData={notionData} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("Services page error:", error)
    // 오류 발생 시 기본 UI 표시
    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
          </div>
          <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
              <h3 className="text-[#c44f6a] text-lg font-medium">오류 발생</h3>
            </div>
            <p className="text-[#c44f6a]">
              데이터를 불러오는 중 오류가 발생했습니다: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    )
  }
}
