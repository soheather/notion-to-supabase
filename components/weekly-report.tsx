"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, ArrowRight, FileText, PlusCircle, RefreshCw } from "lucide-react"
import { type WeeklyReport, getFieldDisplayName, formatValue } from "@/lib/report-utils"
import { getLatestWeeklyReport, getAllWeeklyReports, getWeeklyReportByDate } from "@/lib/report-utils"

export function WeeklyReportViewer() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [reportList, setReportList] = useState<{ id: string; reportDate: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  // 리포트 로드
  const loadReport = useCallback(async (date?: string) => {
    try {
      setLoading(true)
      setError(null)

      let reportData: WeeklyReport | null

      if (date) {
        reportData = await getWeeklyReportByDate(date)
      } else {
        reportData = await getLatestWeeklyReport()
      }

      if (reportData) {
        setReport(reportData)
      } else {
        setError("리포트를 찾을 수 없습니다.")
      }

      // 리포트 목록 가져오기
      const reports = await getAllWeeklyReports()
      setReportList(reports)
    } catch (err) {
      console.error("리포트 로드 오류:", err)
      setError(err instanceof Error ? err.message : "리포트를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  // 리포트 생성 함수
  const generateReport = useCallback(async () => {
    try {
      setGenerating(true)
      setError(null)

      // 리포트 생성 API 호출
      const response = await fetch("/api/generate-report")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "리포트 생성 중 오류가 발생했습니다.")
      }

      const result = await response.json()

      // 성공 메시지 표시
      alert("리포트가 성공적으로 생성되었습니다!")

      // 새로 생성된 리포트 로드
      await loadReport()
    } catch (err) {
      console.error("리포트 생성 오류:", err)
      setError(err instanceof Error ? err.message : "리포트 생성 중 오류가 발생했습니다.")
    } finally {
      setGenerating(false)
    }
  }, [loadReport])

  // 컴포넌트 마운트 시 최신 리포트 로드
  useEffect(() => {
    loadReport()
  }, [loadReport])

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  // 리포트 날짜 선택 핸들러
  const handleReportSelect = useCallback(
    (date: string) => {
      loadReport(date)
    },
    [loadReport],
  )

  // 리포트 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    loadReport(report?.reportDate)
  }, [loadReport, report?.reportDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">리포트 로딩 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#c44f6a]">리포트 로드 오류</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => loadReport()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>

            <Button
              onClick={generateReport}
              className="mt-4 bg-[#a5a6f6] hover:bg-[#8384f3] text-white"
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              {generating ? "생성 중..." : "새 리포트 생성"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#a5a6f6]" />
            주간 리포트
          </CardTitle>
          <CardDescription>아직 생성된 리포트가 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#f8f8fc] p-4 rounded-lg mb-4">
            <h3 className="font-medium text-[#2d2d3d] mb-2">리포트 정보</h3>
            <p className="text-[#6e6e85] text-sm">
              매주 월요일 오전 8시에 자동으로 리포트가 생성됩니다. 아직 리포트가 생성되지 않았거나 프로젝트 데이터가
              충분하지 않을 수 있습니다.
            </p>
          </div>

          <div className="bg-[#e1f5c4] bg-opacity-30 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-[#5a7052] flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              리포트 생성 방법
            </h3>
            <p className="text-[#5a7052] text-sm">
              아래 버튼을 클릭하여 현재 날짜 기준으로 리포트를 즉시 생성할 수 있습니다. 생성된 리포트는 프로젝트의 현재
              상태를 기록하며, 향후 리포트와 비교 기준이 됩니다.
            </p>
          </div>

          <Button
            onClick={generateReport}
            className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white mt-4 w-full h-12 text-base"
            disabled={generating}
          >
            {generating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <PlusCircle className="h-5 w-5 mr-2" />}
            {generating ? "리포트 생성 중..." : "지금 리포트 생성하기"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d2d3d] flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-[#a5a6f6]" />
            {formatDate(report.reportDate)} 주간 리포트
          </h2>
          <p className="text-[#6e6e85] mt-1">
            {report.previousSnapshotDate ? (
              <>
                {formatDate(report.previousSnapshotDate)} <ArrowRight className="inline h-3 w-3 mx-1" />{" "}
                {formatDate(report.reportDate)} 기간의 변경 사항
              </>
            ) : (
              "첫 번째 리포트입니다."
            )}
          </p>
          {reportList.length > 1 && (
            <p className="text-xs text-[#a5a6f6] mt-1">
              총 {reportList.length}개의 주간 리포트가 있습니다. 상단 드롭다운에서 다른 주의 리포트를 선택할 수
              있습니다.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {reportList.length > 0 && (
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a5a6f6]" />
                <select
                  className="pl-10 pr-4 py-2 rounded-md border border-[#e9e9f2] bg-[#f8f8fc] text-[#6e6e85] appearance-none w-full sm:w-auto min-w-[220px]"
                  value={report.reportDate}
                  onChange={(e) => handleReportSelect(e.target.value)}
                  aria-label="리포트 선택"
                >
                  <option value="" disabled>
                    리포트 선택
                  </option>
                  {reportList.map((item) => (
                    <option key={item.id} value={item.reportDate}>
                      {formatDate(item.reportDate)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 1L6 5L11 1"
                      stroke="#a5a6f6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="icon" className="h-10 w-10">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              onClick={generateReport}
              className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white flex items-center gap-2 whitespace-nowrap"
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {generating ? "생성 중..." : "새 리포트 생성"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="changes" className="w-full">
        <TabsList className="mb-6 bg-[#f8f8fc] p-1 rounded-lg">
          <TabsTrigger
            value="changes"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2d2d3d] data-[state=active]:shadow-sm"
          >
            변경 사항
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2d2d3d] data-[state=active]:shadow-sm"
          >
            신규 프로젝트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#a5a6f6]" />
                변경된 프로젝트 ({report.changedProjects.length}개)
              </CardTitle>
              <CardDescription>이전 주 대비 데이터가 변경된 프로젝트 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {report.changedProjects.length === 0 ? (
                <div className="text-center py-8 text-[#6e6e85]">변경된 프로젝트가 없습니다.</div>
              ) : (
                <div className="space-y-6">
                  {report.changedProjects.map((project) => (
                    <div key={project.id} className="border border-[#f0f0f5] rounded-lg overflow-hidden">
                      <div className="bg-[#f8f8fc] p-4 border-b border-[#f0f0f5]">
                        <h3 className="font-medium text-[#2d2d3d]">{project.title}</h3>
                      </div>
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">필드</TableHead>
                              <TableHead className="w-1/3">이전 값</TableHead>
                              <TableHead className="w-1/3">새 값</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.changes.map((change, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{getFieldDisplayName(change.field)}</TableCell>
                                <TableCell>{formatValue(change.oldValue)}</TableCell>
                                <TableCell className="font-medium text-[#3a6ea5]">
                                  {formatValue(change.newValue)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2 text-[#a5a6f6]" />
                신규 프로젝트 ({report.newProjects.length}개)
              </CardTitle>
              <CardDescription>이번 주에 새로 추가된 프로젝트 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {report.newProjects.length === 0 ? (
                <div className="text-center py-8 text-[#6e6e85]">새로 추가된 프로젝트가 없습니다.</div>
              ) : (
                <div className="space-y-6">
                  {report.newProjects.map((project) => (
                    <div key={project.id} className="border border-[#f0f0f5] rounded-lg overflow-hidden">
                      <div className="bg-[#f8f8fc] p-4 border-b border-[#f0f0f5] flex justify-between items-center">
                        <h3 className="font-medium text-[#2d2d3d]">{project.title}</h3>
                        <Badge className="bg-[#e1f5c4] text-[#5a7052]">신규</Badge>
                      </div>
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/3">필드</TableHead>
                              <TableHead className="w-2/3">값</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(project)
                              .filter(([key]) => !["id", "created_at"].includes(key))
                              .map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell className="font-medium">{getFieldDisplayName(key)}</TableCell>
                                  <TableCell>{formatValue(value)}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-[#6e6e85] text-center">
        리포트 생성 시간: {new Date(report.generatedAt).toLocaleString("ko-KR")}
      </div>
    </div>
  )
}
