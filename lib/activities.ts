import type { Activity, UserProfile } from "./types"

const STORAGE_KEY = "digital-habit-activities"
const PROFILE_KEY = "digital-habit-profile"

export function getActivities(): Activity[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw).activities ?? [] : []
  } catch {
    return []
  }
}

export function saveActivity(activity: Activity): void {
  const existing = getActivities()
  existing.push(activity)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: existing }))
}

export function saveActivities(activities: Activity[]): void {
  const existing = getActivities()
  existing.push(...activities)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: existing }))
}

export function updateActivity(updated: Activity): void {
  const existing = getActivities().map((a) => (a.id === updated.id ? updated : a))
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: existing }))
}

export function deleteActivity(id: string): void {
  const existing = getActivities().filter((a) => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: existing }))
}

const defaultProfile: UserProfile = {
  name: "Tyas",
  fullName: "Tyas Likwantoro",
  email: "s.kesumaningtyas.l@email.com",
  joinDate: "12 Juni 2026",
  avatarUrl: "",
  bannerId: "blue",
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
