"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, Filter, MoreHorizontal, ExternalLink, ArrowUpDown } from "lucide-react"
import { Loader2 } from "lucide-react"

type ServiceItem = {
  id: string
  company: string
  product: string
  make: string
  status: string
  po: string
  sw: string
  lastUpdated: string
}

export function ServicesList({ notionData }: { notionData: any }) {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ServiceItem | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })

  useEffect(() => {
    try {
      if (!notionData || !notionData.results) {
        setServices([])
        setLoading(false)
        return
      }

      const processedData = notionData.results.map((item: any) => {
        return {
          id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
          company: getPropertyValue(item, "Company") || "미지정",
          product:
            getPropertyValue(item, "Product") ||
            getPropertyValue(item, "Name") ||
            getPropertyValue(item, "이름") ||
            "미지정",
          make: getPropertyValue(item, "Make") || "미지정",
          status: getPropertyValue(item, "Status") || "상태 없음",
          po: getPropertyValue(item, "PO") || "없음",
          sw: getPropertyValue(item, "SW") || "없음",
          lastUpdated: item.last_edited_time
            ? new Date(item.last_edited_time).toLocaleDateString("ko-KR")
            : new Date().toLocaleDateString("ko-KR"),
        }
      })
      setServices(processedData)
    } catch (error) {
      console.error("서비스 데이터 처리 오류:", error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [notionData])

  // 속성값 추출 헬퍼 함수
  function getPropertyValue(item: any, propertyName: string): string | null {
    try {
      if (!item || !item.properties || !item.properties[propertyName]) {
        return null
      }

      const property = item.properties[propertyName]

      // 속성 타입에 따라 값 추출
      switch (property.type) {
        case "select":
          return translateYesNo(property.select?.name) || null
        case "multi_select":
          return translateYesNo(property.multi_select?.[0]?.name) || null
        case "rich_text":
          return translateYesNo(property.rich_text?.[0]?.plain_text) || null
        case "title":
          return translateYesNo(property.title?.[0]?.plain_text) || null
        case "people":
          return translateYesNo(property.people?.[0]?.name) || null
        case "checkbox":
          return property.checkbox ? "있음" : "없음"
        default:
          return null
      }
    } catch (error) {
      console.error(`${propertyName} 속성 추출 오류:`, error)
      return null
    }
  }

  // Yes/No 값을 한글로 변환하는 헬퍼 함수
  function translateYesNo(value: string | null | undefined): string | null | undefined {
    if (!value) return value

    if (value.toLowerCase() === "yes") return "있음"
    if (value.toLowerCase() === "no") return "없음"

    return value
  }

  // 정렬 처리 함수
  const requestSort = (key: keyof ServiceItem) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // 정렬된 데이터 가져오기
  const getSortedServices = () => {
    const filteredServices = services.filter(
      (service) =>
        service.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.po.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.sw.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (!sortConfig.key) return filteredServices

    return [...filteredServices].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // 상태에 따른 배지 색상 결정 - 이미지 스타일에 맞게 업데이트
  const getStatusBadge = (status: string) => {
    // 정확한 상태값 매칭
    if (status === "사용") {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status === "미사용") {
      return <Badge className="bg-[#ffd6e0] text-[#c44f6a] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status === "내부통합고려중") {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status === "내부통합") {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{status}</Badge>
    }

    // 기존 패턴 기반 매칭은 유지 (fallback)
    else if (status.toLowerCase().includes("사용") || status.toLowerCase() === "운영중") {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.toLowerCase().includes("개발") || status.toLowerCase().includes("준비")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.toLowerCase().includes("중단") || status.toLowerCase().includes("미사용")) {
      return <Badge className="bg-[#ffd6e0] text-[#c44f6a] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.toLowerCase().includes("검토") || status.toLowerCase().includes("계획")) {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#f0f0f5]">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#a5a6f6]" />
            <Input
              placeholder="서비스 검색..."
              className="pl-10 border-[#e9e9f2] bg-[#f8f8fc] focus:bg-white transition-colors rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-[#e9e9f2] text-[#6e6e85] hover:text-[#4b4b63] bg-[#f8f8fc] hover:bg-[#f0f0f8] rounded-lg"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                <DropdownMenuItem onClick={() => setSearchTerm("사용")} className="cursor-pointer">
                  사용 중인 서비스
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("개발")} className="cursor-pointer">
                  개발 중인 서비스
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("중단")} className="cursor-pointer">
                  중단된 서비스
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f8f8fc] hover:bg-[#f8f8fc]">
              <TableHead className="w-[150px] font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("company")}>
                  Company
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "company" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[200px] font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("product")}>
                  Product
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "product" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("make")}>
                  Make
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "make" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("status")}>
                  Status
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "status" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("po")}>
                  PO
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "po" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#4b4b63]">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("sw")}>
                  SW
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "sw" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedServices().length > 0 ? (
              getSortedServices().map((service, index) => (
                <TableRow key={service.id} className="group hover:bg-[#f8f8fc] transition-colors">
                  <TableCell className="font-medium text-[#2d2d3d]">{service.company}</TableCell>
                  <TableCell className="text-[#2d2d3d]">{service.product}</TableCell>
                  <TableCell className="text-[#6e6e85]">{service.make}</TableCell>
                  <TableCell>{getStatusBadge(service.status)}</TableCell>
                  <TableCell className="text-[#6e6e85]">{service.po}</TableCell>
                  <TableCell className="text-[#6e6e85]">{service.sw}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#a5a6f6]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                        <DropdownMenuItem className="cursor-pointer">
                          <ExternalLink className="h-4 w-4 mr-2 text-[#a5a6f6]" />
                          상세 정보
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">히스토리</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[#6e6e85]">
                  검색 결과가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-5 border-t border-[#f0f0f5] text-sm text-[#6e6e85] bg-[#f8f8fc]">
        총 {getSortedServices().length}개 서비스 (전체 {services.length}개 중)
      </div>
    </div>
  )
}

// 명시적으로 기본 내보내기 추가
export default ServicesList
