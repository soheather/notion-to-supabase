// 클라이언트 측 캐싱을 위한 유틸리티 함수

// 메모리 캐시 객체
const CACHE: Record<string, { data: any; timestamp: number }> = {}

// 캐시 만료 시간 (5분)
const CACHE_EXPIRY = 5 * 60 * 1000

/**
 * 데이터를 캐시하고 가져오는 함수
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { forceRefresh?: boolean; expiryMs?: number },
): Promise<T> {
  const { forceRefresh = false, expiryMs = CACHE_EXPIRY } = options || {}

  console.log(`fetchWithCache 호출됨 - 키: ${key}, 강제 새로고침: ${forceRefresh}`)

  // 캐시가 있고, 만료되지 않았으며, 강제 새로고침이 아닌 경우 캐시된 데이터 반환
  const cachedData = CACHE[key]
  const now = Date.now()

  if (!forceRefresh && cachedData && now - cachedData.timestamp < expiryMs) {
    console.log(`캐시된 데이터 사용 - 키: ${key}, 경과 시간: ${now - cachedData.timestamp}ms`)
    return cachedData.data
  }

  // 캐시가 없거나 만료된 경우 새로 데이터 가져오기
  try {
    console.log(`새 데이터 가져오기 - 키: ${key}`)
    const data = await fetchFn()

    // 데이터 캐싱
    CACHE[key] = {
      data,
      timestamp: now,
    }

    console.log(`데이터 캐싱 완료 - 키: ${key}`)
    return data
  } catch (error) {
    // 에러 발생 시 캐시된 데이터가 있으면 반환 (오래된 데이터라도 보여주기)
    if (cachedData) {
      console.warn(`오류 발생, 캐시된 데이터 사용 - 키: ${key}`, error)
      return cachedData.data
    }

    console.error(`오류 발생, 캐시된 데이터 없음 - 키: ${key}`, error)
    throw error
  }
}

/**
 * 특정 키의 캐시를 무효화하는 함수
 */
export function invalidateCache(key: string): void {
  delete CACHE[key]
}

/**
 * 모든 캐시를 무효화하는 함수
 */
export function clearAllCache(): void {
  Object.keys(CACHE).forEach((key) => {
    delete CACHE[key]
  })
}
