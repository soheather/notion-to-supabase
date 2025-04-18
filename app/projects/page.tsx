import { fetchProjectsData, checkProjectsTable, getCreateProjectsTableSQL } from "@/app/actions/projects"
import ProjectsList from "@/components/projects-list"
import { AlertTriangle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RefreshProjectsButton } from "@/components/refresh-projects-button"

export const dynamic = "force-dynamic" // 항상 동적으로 렌더링
export const revalidate = 0 // 캐시 비활성화

export default async function ProjectsPage() {
  try {
    // 프로젝트 테이블 존재 여부 확인
    const tableCheck = await checkProjectsTable()

    // 테이블이 존재하지 않는 경우
    if (!tableCheck.exists) {
      // SQL 스크립트 가져오기
      const createTableSQL = await getCreateProjectsTableSQL()

      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 실시간 동기화</p>
            </div>
            <div className="bg-[#fff2c4] border border-[#ffe7a0] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#a17f22] mr-2" />
                <h3 className="text-[#a17f22] text-lg font-medium">Supabase 테이블이 없습니다</h3>
              </div>
              <p className="text-[#a17f22] mb-4">
                Supabase 데이터베이스에 'project_list' 테이블이 존재하지 않습니다. 아래 SQL을 사용하여 Supabase
                대시보드에서 테이블을 생성해주세요.
              </p>
              <pre className="bg-[#ffe7a0] bg-opacity-30 p-4 rounded-md overflow-auto text-sm">
                <code>{createTableSQL}</code>
              </pre>
              <div className="mt-6">
                <Button asChild className="bg-[#a17f22] hover:bg-[#8a6a1d] text-white">
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Supabase 대시보드 열기
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      )
    }

    // 서버 컴포넌트에서 Supabase 데이터 가져오기
    const projectsData = await fetchProjectsData()

    // Supabase 오류 확인
    if (projectsData?.error) {
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 실시간 동기화</p>
            </div>
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
                <h3 className="text-[#c44f6a] text-lg font-medium">Supabase 연동 오류</h3>
              </div>
              <p className="text-[#c44f6a] mb-4">{projectsData.error}</p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음 사항을 확인해보세요:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    환경 변수 <code className="bg-[#ffc2d1] px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>와{" "}
                    <code className="bg-[#ffc2d1] px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>가 올바르게
                    설정되었는지 확인하세요.
                  </li>
                  <li>Supabase 프로젝트가 활성화되어 있는지 확인하세요.</li>
                  <li>projects 테이블이 올바르게 생성되었는지 확인하세요.</li>
                  <li>
                    서버를 재시작해보세요 (<code className="bg-[#ffc2d1] px-1 rounded">npm run dev</code>).
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 실시간 동기화</p>
            </div>
            <RefreshProjectsButton />
          </div>
          <ProjectsList projectsData={projectsData} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("Projects page error:", error)
    // 오류 발생 시 기본 UI 표시
    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">프로젝트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">Supabase 데이터베이스와 실시간 동기화</p>
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

