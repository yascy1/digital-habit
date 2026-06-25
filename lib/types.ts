export interface Activity {
  id: string
  category: string
  durationHours: number
  durationMinutes: number
  date: string
  notes: string
  createdAt: number
}

export interface UserProfile {
  name: string
  fullName: string
  email: string
  joinDate: string
  avatarUrl: string
  bannerId: string
}
