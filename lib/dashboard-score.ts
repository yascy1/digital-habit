import type { Activity } from "./types"

export function computeWellnessScore(activities: Activity[]): { score: number; label: string; description: string } {
  if (activities.length === 0) return { score: 0, label: "Belum ada data", description: "Mulai catat aktivitas untuk melihat skor." }

  const totalAll = activities.reduce((s, a) => s + a.durationHours * 60 + a.durationMinutes, 0)
  const totalBelajarKerja = activities
    .filter(act => act.category === "belajar-kerja")
    .reduce((s, act) => s + act.durationHours * 60 + act.durationMinutes, 0)

  const uniqueDays = new Set(activities.map(act => act.date)).size
  const rataRataHarian = uniqueDays > 0 ? totalAll / uniqueDays : 0

  const belajarRatio = totalAll > 0 ? (totalBelajarKerja / totalAll) * 100 : 0
  const screenTimeScore = rataRataHarian <= 360 ? 100 : Math.max(0, 100 - ((rataRataHarian - 360) / 360 * 100))
  const score = Math.round((belajarRatio * 0.6) + (screenTimeScore * 0.4))

  if (score >= 80) return { score, label: "Sangat Baik", description: "Kesehatan digitalmu luar biasa!" }
  if (score >= 60) return { score, label: "Baik", description: "Pola digitalmu cukup sehat." }
  if (score >= 40) return { score, label: "Cukup", description: "Masih ada ruang untuk perbaikan." }
  if (score >= 20) return { score, label: "Kurang", description: "Pertimbangkan untuk mengurangi screen time." }
  return { score, label: "Sangat Kurang", description: "Segera evaluasi kebiasaan digitalmu." }
}
