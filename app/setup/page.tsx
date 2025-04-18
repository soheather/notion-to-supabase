"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertTriangle, Database, RefreshCcw, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const [setupInfo, setSetupInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSetup = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/setup-supabase")
      const data = await response.json()

      setSetupInfo(data)
    } catch (err) {
      console.error("설정 확인 오류:", err)
      setError(err instanceof Error ? err.message : "설정을 확인하는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSetup()
  }, [])

  if (loading) {
    return (
      <div className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">Supabase 설정</h1>
            <p className="text-[#6e6e85] mt-1">데이터베이스 연결 및 테이블 설정</p>
          </div>

          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
            <span className="ml-2 text-[#6e6e85]">Supabase 설정 확인 중...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">Supabase 설정</h1>
          <p className="text-[#6e6e85] mt-1">데이터베이스 연결 및 테이블 설정</p>
        </div>

        {error && (
          <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6 mb-6">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
              <h3 className="text-[#c44f6a] text-lg font-medium">설정 확인 오류</h3>
            </div>
            <p className="text-[#c44f6a]">{error}</p>

            <Button onClick={checkSetup} className="mt-4 bg-[#c44f6a] hover:bg-[#b33d59] text-white">
              <RefreshCcw className="h-4 w-4 mr-2" />
              다시 확인
            </Button>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-[#a5a6f6]" />
              Supabase 연결 상태
            </CardTitle>
            <CardDescription>Supabase 데이터베이스 연결 및 테이블 설정 상태</CardDescription>
          </CardHeader>
          <CardContent>
            {setupInfo && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-md ${
                    setupInfo.status === "success"
                      ? "bg-[#e1f5c4] text-[#5a7052]"
                      : setupInfo.status === "table_not_found"
                        ? "bg-[#fff2c4] text-[#a17f22]"
                        : "bg-[#ffd6e0] text-[#c44f6a]"
                  }`}
                >
                  {setupInfo.status === "success" ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span>{setupInfo.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>{setupInfo.message}</span>
                    </div>
                  )}
                </div>

                {setupInfo.status === "table_not_found" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[#4b4b63] mb-2">필요한 테이블 구조</h4>
                      <div className="bg-[#f8f8fc] p-4 rounded-md overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#e0e0f0]">
                              <th className="text-left py-2 px-4">컬럼명</th>
                              <th className="text-left py-2 px-4">타입</th>
                              <th className="text-left py-2 px-4">기본 키</th>
                            </tr>
                          </thead>
                          <tbody>
                            {setupInfo.requiredColumns.map((col: any, index: number) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#f8f8fc]"}>
                                <td className="py-2 px-4">{col.name}</td>
                                <td className="py-2 px-4">{col.type}</td>
                                <td className="py-2 px-4">{col.isPrimary ? "✓" : ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-[#4b4b63] mb-2">SQL 예제</h4>
                      <pre className="bg-[#f8f8fc] p-4 rounded-md overflow-x-auto text-xs">{setupInfo.sqlExample}</pre>
                    </div>
                  </div>
                )}

                {setupInfo.status === "success" && setupInfo.tableInfo && (
                  <div>
                    <h4 className="font-medium text-[#4b4b63] mb-2">테이블 정보</h4>
                    <div className="bg-[#f8f8fc] p-4 rounded-md">
                      <p className="text-[#6e6e85] mb-2">
                        샘플 데이터: {setupInfo.tableInfo.hasSampleData ? "있음" : "없음"}
                      </p>

                      {setupInfo.sampleData && (
                        <details>
                          <summary className="cursor-pointer text-[#4b4b63] font-medium">샘플 데이터 보기</summary>
                          <pre className="mt-2 bg-white p-2 rounded-md overflow-x-auto text-xs">
                            {JSON.stringify(setupInfo.sampleData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={checkSetup} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              새로고침
            </Button>

            <Button asChild>
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase 대시보드 열기
              </a>
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-between">
          <Button asChild variant="outline">
            <a href="/gallery">갤러리로 돌아가기</a>
          </Button>

          <Button asChild>
            <a href="/api/test-supabase" target="_blank" rel="noopener noreferrer">
              <Database className="h-4 w-4 mr-2" />
              Supabase 연결 테스트
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
