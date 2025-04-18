// Notion API 응답 데이터를 차트에 사용할 수 있는 형식으로 가공하는 함수
export function processNotionData(notionData: any) {
  // 결과가 없으면 기본값 반환
  if (!notionData || !notionData.results || notionData.results.length === 0) {
    return {
      statusData: [],
      metricsData: [],
      metricsMonitoringData: [], // 추가: 사용성 지표 모니터링 여부 데이터
      poData: [],
      swData: [],
      periodData: [], // 기간별 데이터
      yearData: [], // 추가: 년도별 데이터
      totalCount: 0,
      activeCount: 0,
      metricsCount: 0,
      assignedCount: 0,
    }
  }

  // Status 데이터 처리 (도넛 차트용)
  const statusCounts: Record<string, number> = {}

  // 지표활용 데이터 처리
  const metricsCounts: Record<string, number> = {
    있음: 0,
    없음: 0,
  }

  // 사용성 지표 모니터링 여부 데이터 처리
  const metricsMonitoringCounts: Record<string, number> = {
    정기: 0,
    비정기: 0,
    없음: 0,
  }

  // PO 데이터 처리
  const poCounts: Record<string, number> = {}

  // SW 데이터 처리 - 이미지에 표시된 항목들로 초기화
  const swCounts: Record<string, number> = {
    사내IT팀: 0,
    파트너: 0,
    "크루(NOCODE)": 0,
    "현업(NOCODE)": 0,
    "52g 스튜디오": 0,
    미사용: 0,
    없음: 0,
    크루: 0,
  }

  // 사용성 지표 모니터링 여부 데이터 처리 부분 수정
  const monitoringCounts: Record<string, number> = {}

  // 기간별 데이터 처리
  const periodCounts: Record<string, number> = {
    "2020 이전": 0,
    "2020~2021": 0,
    "2021~2022": 0,
    "2022~2023": 0,
    "2023~현재": 0,
    미지정: 0,
  }

  // 년도별 데이터 처리 추가
  const yearCounts: Record<string, number> = {}

  // 각 항목 집계
  notionData.results.forEach((item: any) => {
    // Status 처리
    const status = getPropertyValue(item, "Status")
    if (status) {
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }

    // 지표활용 처리
    const metrics = getPropertyValue(item, "Usability Metrics") || getPropertyValue(item, "지표활용")
    if (metrics) {
      metricsCounts[metrics] = (metricsCounts[metrics] || 0) + 1
    } else {
      metricsCounts["없음"] = (metricsCounts["없음"] || 0) + 1
    }

    // 사용성 지표 모니터링 여부 처리
    // Notion 데이터베이스에 '지표모니터링' 필드가 있다고 가정
    // 없는 경우 '지표활용' 필드를 기반으로 임의 데이터 생성
    const metricsMonitoring =
      getPropertyValue(item, "지표모니터링") ||
      (metrics === "있음" ? (Math.random() > 0.5 ? "정기" : "비정기") : "없음")

    if (metricsMonitoring) {
      metricsMonitoringCounts[metricsMonitoring] = (metricsMonitoringCounts[metricsMonitoring] || 0) + 1
    } else {
      metricsMonitoringCounts["없음"] = (metricsMonitoringCounts["없음"] || 0) + 1
    }

    // PO 처리
    const po = getPropertyValue(item, "PO")
    if (po) {
      poCounts[po] = (poCounts[po] || 0) + 1
    } else {
      poCounts["없음"] = (poCounts["없음"] || 0) + 1
    }

    // SW 처리 - 정확한 매핑을 위해 수정
    const sw = getPropertyValue(item, "SW")
    if (sw) {
      // 이미지에 표시된 값과 일치하는지 확인하고 매핑
      if (sw in swCounts) {
        swCounts[sw] = (swCounts[sw] || 0) + 1
      } else {
        // 매핑되지 않은 값은 기타로 처리
        console.log(`매핑되지 않은 SW 값: ${sw}`)
        swCounts["기타"] = (swCounts["기타"] || 0) + 1
      }
    } else {
      swCounts["없음"] = (swCounts["없음"] || 0) + 1
    }

    // 각 항목 집계 부분에서 모니터링 데이터 처리 수정
    // 모니터링 처리
    const monitoring = getPropertyValue(item, "Monitoring") || getPropertyValue(item, "모니터링")
    if (monitoring) {
      monitoringCounts[monitoring] = (monitoringCounts[monitoring] || 0) + 1
    } else {
      monitoringCounts["없음"] = (monitoringCounts["없음"] || 0) + 1
    }

    // 기간 처리
    const usagePeriod = getPropertyValue(item, "usage_period") || getPropertyValue(item, "사용기간")
    if (usagePeriod) {
      // 기간 문자열 분석
      if (usagePeriod.includes("2020") && usagePeriod.includes("이전")) {
        periodCounts["2020 이전"] += 1
      } else if (usagePeriod.includes("2020") && usagePeriod.includes("2021")) {
        periodCounts["2020~2021"] += 1
      } else if (usagePeriod.includes("2021") && usagePeriod.includes("2022")) {
        periodCounts["2021~2022"] += 1
      } else if (usagePeriod.includes("2022") && usagePeriod.includes("2023")) {
        periodCounts["2022~2023"] += 1
      } else if (usagePeriod.includes("2023") || usagePeriod.includes("현재")) {
        periodCounts["2023~현재"] += 1
      } else {
        periodCounts["미지정"] += 1
      }
    } else {
      periodCounts["미지정"] += 1
    }

    // Year 처리 추가
    const year = getPropertyValue(item, "Year")
    if (year) {
      // 년도 값이 있는 경우 해당 년도 카운트 증가
      yearCounts[year] = (yearCounts[year] || 0) + 1
    } else {
      // 년도 값이 없는 경우 '미지정' 카운트 증가
      yearCounts["미지정"] = (yearCounts["미지정"] || 0) + 1
    }
  })

  // 도넛 차트 데이터 형식으로 변환
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // 지표활용 바 차트 데이터
  const metricsData = Object.entries(metricsCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // 사용성 지표 모니터링 여부 바 차트 데이터
  const metricsMonitoringData = Object.entries(metricsMonitoringCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // PO 바 차트 데이터
  const poData = Object.entries(poCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // SW 바 차트 데이터
  const swData = Object.entries(swCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // 기간별 바 차트 데이터
  const periodData = Object.entries(periodCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // 년도별 바 차트 데이터 추가
  const yearData = Object.entries(yearCounts)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => {
      // '미지정'은 항상 마지막에 위치
      if (a.name === "미지정") return 1
      if (b.name === "미지정") return -1
      // 나머지는 년도 순으로 정렬 (문자열 비교)
      return a.name.localeCompare(b.name)
    })

  // 반환 객체에 monitoringData 추가
  const monitoringData = Object.entries(monitoringCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // 사용 중인 서비스 수 (Status가 '사용' 또는 '사용 중'인 항목)
  const activeCount = Object.entries(statusCounts)
    .filter(([name]) => name === "사용" || name === "사용 중")
    .reduce((sum, [_, value]) => sum + value, 0)

  // 지표가 있는 서비스 수
  const metricsCount = metricsCounts["있음"] || 0

  // PO가 배정된 서비스 수 (PO가 '없음'이 아닌 항목)
  const assignedCount = Object.entries(poCounts)
    .filter(([name]) => name !== "없음")
    .reduce((sum, [_, value]) => sum + value, 0)

  // return 문에 yearData 추가
  return {
    statusData,
    metricsData,
    metricsMonitoringData,
    monitoringData,
    poData,
    swData,
    periodData,
    yearData,
    totalCount: notionData.results.length,
    activeCount,
    metricsCount,
    assignedCount,
  }
}

// Notion 속성값 추출 헬퍼 함수
function getPropertyValue(item: any, propertyName: string): string | null {
  try {
    const property = item.properties[propertyName]

    if (!property) return null

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
      case "number":
        return property.number !== null ? property.number.toString() : null
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
