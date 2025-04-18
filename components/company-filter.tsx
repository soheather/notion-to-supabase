"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

interface CompanyFilterProps {
  projects: any[]
  selectedCompany: string | null
  onCompanyChange: (company: string | null) => void
}

export function CompanyFilter({ projects, selectedCompany, onCompanyChange }: CompanyFilterProps) {
  const [companies, setCompanies] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setCompanies([])
      return
    }

    // 회사별 프로젝트 수 계산
    const companyMap = new Map<string, number>()

    projects.forEach((project) => {
      // 회사명 정규화
      let company = project.company || "미지정"

      // GS E&R 관련 회사명 통합
      if (company.includes("GS E&R") || company.includes("GS동해전력") || company.includes("포천그린에너지")) {
        company = "GS E&R"
      }

      companyMap.set(company, (companyMap.get(company) || 0) + 1)
    })

    // 회사 목록 생성 (프로젝트 수 내림차순 정렬)
    const companyList = Array.from(companyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    setCompanies(companyList)
  }, [projects])

  const handleValueChange = (value: string) => {
    if (value === "all") {
      onCompanyChange(null)
    } else {
      onCompanyChange(value)
    }
  }

  return (
    <div className="w-full">
      <Select value={selectedCompany || "all"} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full border-[#e9e9f2] bg-[#f8f8fc] hover:bg-[#f0f0f8] h-10">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-[#a5a6f6]" />
            <SelectValue placeholder="회사 선택" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span>전체 회사</span>
              <Badge className="ml-2 bg-[#f0f0f8] text-[#6e6e85]">{projects?.length || 0}</Badge>
            </div>
          </SelectItem>

          {companies.map((company) => (
            <SelectItem key={company.name} value={company.name}>
              <div className="flex items-center justify-between w-full">
                <span>{company.name}</span>
                <Badge className="ml-2 bg-[#f0f0f8] text-[#6e6e85]">{company.count}</Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
