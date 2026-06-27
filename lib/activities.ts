import type { Activity, UserProfile } from "./types"

function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null
  try {
    const session = JSON.parse(localStorage.getItem("digital-habit-user") ?? "{}")
    return session.email?.toLowerCase() ?? null
  } catch {
    return null
  }
}

function getActivitiesKey(email: string): string {
  return `digital-habit-activities-${email}`
}

function getProfileKey(email: string): string {
  return `digital-habit-profile-${email}`
}

export function getActivities(): Activity[] {
  const email = getCurrentUserEmail()
  if (!email) return []
  try {
    const raw = localStorage.getItem(getActivitiesKey(email))
    return raw ? JSON.parse(raw).activities ?? [] : []
  } catch {
    return []
  }
}

export function saveActivity(activity: Activity): void {
  const email = getCurrentUserEmail()
  if (!email) return
  const existing = getActivities()
  existing.push(activity)
  localStorage.setItem(getActivitiesKey(email), JSON.stringify({ activities: existing }))
}

export function saveActivities(activities: Activity[]): void {
  const email = getCurrentUserEmail()
  if (!email) return
  const existing = getActivities()
  existing.push(...activities)
  localStorage.setItem(getActivitiesKey(email), JSON.stringify({ activities: existing }))
}

export function updateActivity(updated: Activity): void {
  const email = getCurrentUserEmail()
  if (!email) return
  const existing = getActivities().map((a) => (a.id === updated.id ? updated : a))
  localStorage.setItem(getActivitiesKey(email), JSON.stringify({ activities: existing }))
}

export function deleteActivity(id: string): void {
  const email = getCurrentUserEmail()
  if (!email) return
  const existing = getActivities().filter((a) => a.id !== id)
  localStorage.setItem(getActivitiesKey(email), JSON.stringify({ activities: existing }))
}

const defaultProfile: UserProfile = {
  name: "",
  fullName: "",
  email: "",
  joinDate: "",
  avatarUrl: "",
  bannerId: "blue",
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile
  const email = getCurrentUserEmail()
  if (!email) return defaultProfile
  try {
    const raw = localStorage.getItem(getProfileKey(email))
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) }
    const session = JSON.parse(localStorage.getItem("digital-habit-user") ?? "{}")
    return { ...defaultProfile, name: session.name ?? "", fullName: session.name ?? "", email: session.email }
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: UserProfile): void {
  const email = getCurrentUserEmail()
  if (!email) return
  localStorage.setItem(getProfileKey(email), JSON.stringify(profile))
}
