const STREAK_KEY = "digital-habit-streak"

function getTodayStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function getYesterdayStr(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`
}

export function getStreak(): number {
  const today = getTodayStr()
  const yesterday = getYesterdayStr()
  const stored = localStorage.getItem(STREAK_KEY)
  const parsed = stored ? JSON.parse(stored) : null

  if (!parsed) return 0
  if (parsed.lastUpdated === today) return parsed.value
  if (parsed.lastUpdated === yesterday) return parsed.value
  return 0
}

export function updateStreak(): void {
  const today = getTodayStr()
  const yesterday = getYesterdayStr()
  const stored = localStorage.getItem(STREAK_KEY)
  const parsed = stored ? JSON.parse(stored) : null

  if (!parsed) {
    localStorage.setItem(
      STREAK_KEY,
      JSON.stringify({ value: 1, lastUpdated: today })
    )
    return
  }

  if (parsed.lastUpdated === today) return

  if (parsed.lastUpdated === yesterday) {
    localStorage.setItem(
      STREAK_KEY,
      JSON.stringify({ value: parsed.value + 1, lastUpdated: today })
    )
    return
  }

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ value: 1, lastUpdated: today })
  )
}
