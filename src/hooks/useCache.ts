const CACHE_DURATION = 1000 * 60 * 30 // 30 minutos

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() }
  localStorage.setItem(key, JSON.stringify(entry))
}
