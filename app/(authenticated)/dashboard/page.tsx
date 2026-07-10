"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  IconClock,
  IconMoon,
  IconDeviceMobile,
  IconTrendingUp,
  IconCheck,
  IconCalendar,
  IconHeart,
  IconChevronDown,
  IconCalendarEvent,
  IconCalendarMonth,
  IconInfoCircle,
  IconChevronLeft,
  IconChevronRight,
  IconBulb
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
} from "recharts"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { getActivities, getProfile } from "@/lib/activities"
import { getLocalDateStr } from "@/lib/utils"
import { computeWellnessScore } from "@/lib/dashboard-score"
import type { Activity } from "@/lib/types"


// BAGIAN 1: KONFIGURASI GRAFIK & DATA STATIS

const lineChartConfig = {
  screentime: {
    label: "Screentime (jam)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const donutChartConfig = {
  value: {
    label: "Persentase",
  },
  "Media Sosial": {
    label: "Media Sosial",
    color: "#3B82F6", // Biru
  },
  "Belajar / Kerja": {
    label: "Belajar / Kerja",
    color: "#10B981", // Hijau
  },
  "Hiburan": {
    label: "Hiburan",
    color: "#F59E0B", // Orange
  },
  "Gaming": {
    label: "Gaming",
    color: "#8B5CF6", // Ungu
  },
  "Lainnya": {
    label: "Lainnya",
    color: "#64748B", // Abu-abu
  },
} satisfies ChartConfig

const dailyTips = [
  "Terapkan aturan 20-20-20. Setelah menatap layar selama 20 menit, alihkan pandangan ke objek yang berjarak sekitar 6 meter selama 20 detik, seperti langit atau pepohonan.",
  "Hindari menggunakan ponsel, tablet, atau laptop sekitar 1 jam sebelum tidur agar kualitas tidur tetap terjaga.",
  "Berdiri dan lakukan peregangan ringan setiap 30 sampai 60 menit untuk mengurangi dampak duduk terlalu lama.",
  "Gunakan Focus Mode atau Do Not Disturb saat belajar atau bekerja agar notifikasi tidak mengganggu konsentrasi.",
  "Nonaktifkan notifikasi dari aplikasi yang tidak penting untuk mengurangi distraksi dan membantu menjaga fokus.",
  "Letakkan layar sekitar 50 sampai 70 cm dari mata dan posisikan bagian atas layar sejajar atau sedikit di bawah tinggi mata untuk mengurangi ketegangan mata dan leher.",
  "Sesuaikan tingkat kecerahan layar dengan kondisi ruangan. Layar yang terlalu terang maupun terlalu redup dapat membuat mata lebih cepat lelah.",
  "Luangkan waktu setiap hari untuk melakukan aktivitas tanpa perangkat digital, seperti membaca buku, berolahraga, atau berjalan santai.",
  "Hindari menggunakan gadget saat makan agar dapat menikmati waktu makan dengan lebih fokus dan meningkatkan interaksi dengan orang di sekitar.",
  "Tentukan tujuan sebelum membuka media sosial atau aplikasi hiburan agar terhindar dari kebiasaan scrolling tanpa tujuan.",
]

const categoryLabels: Record<string, string> = {
  "media-sosial": "Media Sosial",
  "belajar-kerja": "Belajar / Kerja",
  "hiburan": "Hiburan",
  "gaming": "Gaming",
  "lainnya": "Lainnya",
}

const chartColors: Record<string, string> = {
  "Media Sosial": donutChartConfig["Media Sosial"].color,
  "Belajar / Kerja": donutChartConfig["Belajar / Kerja"].color,
  "Hiburan": donutChartConfig["Hiburan"].color,
  "Gaming": donutChartConfig["Gaming"].color,
  "Lainnya": donutChartConfig["Lainnya"].color,
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

// BAGIAN 2: FUNGSI PEMBANTU (HELPER FUNCTIONS)
// Fungsi-fungsi ini memproses tanggal, menghitung durasi, dan membentuk rentang waktu

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

function toMinutes(a: Activity): number {
  return a.durationHours * 60 + a.durationMinutes
}

function makeDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function getWeekRange(offset: number): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: monday, end: sunday }
}

function getWeekDateRange(offset: number): string[] {
  const { start, end } = getWeekRange(offset)
  const result: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    result.push(makeDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

function getMonthRange(offset: number): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + offset
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start, end }
}

function getMonthDateRange(offset: number): string[] {
  const { start, end } = getMonthRange(offset)
  const result: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    result.push(makeDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

function formatWeekLabel(offset: number): string {
  const { start, end } = getWeekRange(offset)
  const s = start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  const e = end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  return `${s} - ${e}`
}

function formatMonthLabel(offset: number): string {
  const { start } = getMonthRange(offset)
  return start.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}


// BAGIAN 3: FUNGSI PENGOLAHAN DATA (ANALYTICS)
// Mengolah data aktivitas mentah menjadi angka untuk grafik & statistik

function filterActivities(activities: Activity[], dates: string[]): Activity[] {
  const set = new Set(dates)
  return activities.filter((a) => set.has(a.date))
}

function sumMinutes(activities: Activity[]): number {
  return activities.reduce((s, a) => s + toMinutes(a), 0)
}

function formatMinutes(min: number): string {
  if (min === 0) return "0j 0m"
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h > 0 ? h + 'j ' : ''}${m}m`
}

function getScreenTimeTrend(activities: Activity[], dates: string[]) {
  const grouped: Record<string, number> = {}
  for (const date of dates) grouped[date] = 0

  for (const a of activities) {
    if (grouped[a.date] !== undefined) {
      grouped[a.date] += toMinutes(a)
    }
  }

  return dates.map((date) => {
    const d = new Date(date + "T00:00:00")
    return {
      day: dates.length <= 7 ? dayNames[d.getDay()] : formatDate(date),
      screentime: Math.round((grouped[date] / 60) * 10) / 10,  // ← konversi ke jam (misal 3)
    }
  })
}

function computeDonutData(activities: Activity[]) {
  const catMinutes: Record<string, number> = {}
  for (const a of activities) {
    const label = categoryLabels[a.category] ?? "Lainnya"
    catMinutes[label] = (catMinutes[label] ?? 0) + toMinutes(a)
  }

  const total = Object.values(catMinutes).reduce((s, v) => s + v, 0)
  if (total === 0) return []

  const sorted = Object.entries(catMinutes).sort((a, b) => b[1] - a[1])
  let remaining = 100
  return sorted.map(([name, value], idx) => {
    const isLast = idx === sorted.length - 1
    const percent = isLast ? remaining : Math.round((value / total) * 100)
    remaining -= percent
    return {
      name,
      value: percent,
      percent,
      minutes: value,
      formattedTime: formatMinutes(value),
      fill: chartColors[name] ?? "var(--chart-5)",
    }
  })
}

function computeStats(
  allActivities: Activity[],
  period: string,
  currentDates: string[],
  previousDates: string[],
  periodDays: number,
  periodLabel: string,
  periodRangeLabel: string,
  wellness: { score: number; label: string; description: string }
) {
  const current = filterActivities(allActivities, currentDates)
  const previous = filterActivities(allActivities, previousDates)

  const currentTotal = sumMinutes(current)
  const previousTotal = sumMinutes(previous)

  const currentCatMinutes: Record<string, number> = {}
  for (const a of current) {
    const label = categoryLabels[a.category] ?? "Lainnya"
    currentCatMinutes[label] = (currentCatMinutes[label] ?? 0) + toMinutes(a)
  }

  const sorted = Object.entries(currentCatMinutes).sort((a, b) => b[1] - a[1])
  const topCat = sorted[0]
  const topCatLabel = topCat ? topCat[0] : "-"
  const topCatPercent = currentTotal > 0 && topCat ? Math.round((topCat[1] / currentTotal) * 100) : 0

  const currentAvg = periodDays > 0 ? Math.round(currentTotal / periodDays) : 0
  const previousAvg = periodDays > 0 ? Math.round(previousTotal / periodDays) : 0

  const diffTotal = currentTotal - previousTotal
  const totalTrendStr = previousTotal === 0
    ? "Belum ada data pembanding"
    : diffTotal === 0
      ? "Sama seperti kemarin"
      : `${diffTotal > 0 ? "▲ Naik" : "▼ Turun"} ${formatMinutes(Math.abs(diffTotal))} dari ${periodLabel}`

  const diffAvg = currentAvg - previousAvg
  const avgTrendStr = period === "Harian"
    ? "Sesi yang kamu catat hari ini"
    : previousTotal === 0
      ? "Belum ada data pembanding"
      : diffAvg === 0
        ? "Sama seperti period sebelumnya"
        : `${diffAvg >= 0 ? "▲ Naik" : "▼ Turun"} ${formatMinutes(Math.abs(diffAvg))} dari ${periodLabel}`

  return {
    stats: [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: currentTotal > 0 ? formatMinutes(currentTotal) : "0j 0m",
        trend: totalTrendStr,
        iconBg: "bg-blue-50/80",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: `${wellness.score}/100`,
        trend: wellness.description,
        iconBg: wellness.score >= 60 ? "bg-emerald-50/80" : wellness.score >= 40 ? "bg-amber-50/80" : "bg-red-50/80",
        iconColor: wellness.score >= 60 ? "text-emerald-500" : wellness.score >= 40 ? "text-amber-500" : "text-red-500",
      },
      {
        icon: period === "Harian" ? IconCheck : IconMoon,
        label: period === "Harian" ? "Total Entri Aktivitas" : "Rata-rata / Hari",
        value: period === "Harian"
          ? `${current.length} kali`
          : (currentTotal > 0 ? formatMinutes(currentAvg) : "0j 0m"),
        trend: period === "Harian"
          ? "Sesi yang kamu catat hari ini"
          : avgTrendStr,
        iconBg: "bg-emerald-50/80",
        iconColor: "text-emerald-500",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: topCatLabel,
        trend: currentTotal > 0 ? `Mendominasi ${topCatPercent}% waktumu` : "Belum ada aktivitas",
        iconBg: "bg-purple-50/80",
        iconColor: "text-purple-500",
      },
    ],
    donutData: computeDonutData(current),
    donutLabel: period === "Harian"
      ? "Distribusi waktu hari ini"
      : `Distribusi ${periodRangeLabel}`,
  }
}

function computeInsights(activities: Activity[], period: string, periodRangeLabel: string) {
  if (activities.length === 0) {
    return [
      {
        icon: IconTrendingUp,
        title: "Belum ada data",
        description: "Mulai catat aktivitas digitalmu untuk melihat insight.",
        iconBg: "bg-blue-50/80",
        iconColor: "text-blue-600",
      },
    ]
  }

  const catMinutes: Record<string, number> = {}
  for (const a of activities) {
    const label = categoryLabels[a.category] ?? "Lainnya"
    catMinutes[label] = (catMinutes[label] ?? 0) + toMinutes(a)
  }
  const totalMin = Object.values(catMinutes).reduce((s, v) => s + v, 0)
  const sorted = Object.entries(catMinutes).sort((a, b) => b[1] - a[1])
  const topCat = sorted[0]
  const topPercent = totalMin > 0 ? Math.round((topCat[1] / totalMin) * 100) : 0

  const periodDesc = period === "Harian" ? "hari ini" : `dalam ${periodRangeLabel}`

  const insights = [
    {
      icon: IconTrendingUp,
      title: `${topCat[0]} mendominasi`,
      description: `${topCat[0]} menyumbang ${topPercent}% total waktu layarmu ${periodDesc}.`,
      iconBg: "bg-blue-50/80",
      iconColor: "text-blue-600",
    },
  ]

  if (sorted.length > 1) {
    const second = sorted[1]
    const secondPercent = totalMin > 0 ? Math.round((second[1] / totalMin) * 100) : 0
    insights.push({
      icon: IconDeviceMobile,
      title: `${second[0]} di posisi kedua`,
      description: `${second[0]} mencapai ${secondPercent}% dari total waktu layar.`,
      iconBg: "bg-emerald-50/80",
      iconColor: "text-emerald-500",
    })
  }

  const uniqueDays = new Set(activities.map((a) => a.date)).size
  const avgMin = uniqueDays > 0 ? Math.round(totalMin / uniqueDays) : 0

  if (avgMin > 360) {
    insights.push({
      icon: IconMoon,
      title: "Screen time cukup tinggi",
      description: `Rata-rata ${formatMinutes(avgMin)} per hari. Pertimbangkan untuk mengurangi waktu layar.`,
      iconBg: "bg-amber-50/80",
      iconColor: "text-amber-500",
    })
  } else {
    insights.push({
      icon: IconHeart,
      title: "Screen time terkendali",
      description: `Rata-rata ${formatMinutes(avgMin)} per hari. Pertahankan pola ini!`,
      iconBg: "bg-orange-50/80", // Menyesuaikan dengan heart icon warna kuning/oranye di foto
      iconColor: "text-orange-500",
    })
  }

  return insights
}

const filters = [
  { label: "Harian", icon: IconCalendar },
  { label: "Mingguan", icon: IconCalendarEvent },
  { label: "Bulanan", icon: IconCalendarMonth }
] as const


// BAGIAN 4: KOMPONEN UTAMA REACT

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Harian")
  const [activities, setActivities] = useState<Activity[]>([])
  const [profile, setProfile] = useState(() => ({
    name: "",
    fullName: "",
    email: "",
    joinDate: "",
    avatarUrl: "",
    bannerId: "blue" as string,
  }))
  const [datePicker, setDatePicker] = useState("")
  const datePickerRef = useRef<HTMLInputElement>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [dailyTip, setDailyTip] = useState(dailyTips[0])
  useEffect(() => {
    const today = getLocalDateStr()
    const key = "digital-habit-daily-tip"
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? "{}")
      if (stored.date === today && typeof stored.tipIndex === "number") {
        setDailyTip(dailyTips[stored.tipIndex])
        return
      }
    } catch { }
    const tipIndex = Math.floor(Math.random() * dailyTips.length)
    localStorage.setItem(key, JSON.stringify({ date: today, tipIndex }))
    setDailyTip(dailyTips[tipIndex])
  }, [])

  useEffect(() => {
    setActivities(getActivities())
    setProfile(getProfile())
    setDatePicker(getLocalDateStr())
    const refresh = () => setActivities(getActivities())
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [])

  const currentDates = useMemo(() => {
    if (activeFilter === "Harian") return [datePicker]
    if (activeFilter === "Mingguan") return getWeekDateRange(weekOffset)
    return getMonthDateRange(monthOffset)
  }, [activeFilter, datePicker, weekOffset, monthOffset])

  const previousDates = useMemo(() => {
    if (activeFilter === "Harian") {
      return [makeDateStr(new Date(new Date(datePicker + "T00:00:00").getTime() - 86400000))]
    }
    if (activeFilter === "Mingguan") return getWeekDateRange(weekOffset - 1)
    return getMonthDateRange(monthOffset - 1)
  }, [activeFilter, datePicker, weekOffset, monthOffset])

  const periodDays = activeFilter === "Harian" ? 1 : activeFilter === "Mingguan" ? 7 : currentDates.length
  const periodLabel = activeFilter === "Harian" ? "kemarin" : activeFilter === "Mingguan" ? "minggu lalu" : "bulan lalu"
  const periodRangeLabel = activeFilter === "Harian"
    ? ""
    : activeFilter === "Mingguan"
      ? formatWeekLabel(weekOffset)
      : formatMonthLabel(monthOffset)

  const lineData = useMemo(() => {
    if (activeFilter === "Harian") return []
    return getScreenTimeTrend(activities, currentDates)
  }, [activities, activeFilter, currentDates])

  const filteredForInsights = useMemo(() => {
    return activities.filter((a) => currentDates.includes(a.date))
  }, [activities, currentDates])

  const wellness = useMemo(() => computeWellnessScore(filteredForInsights), [filteredForInsights])
  const { stats, donutData, donutLabel } = useMemo(
    () => computeStats(activities, activeFilter, currentDates, previousDates, periodDays, periodLabel, periodRangeLabel, wellness),
    [activities, activeFilter, currentDates, previousDates, periodDays, periodLabel, periodRangeLabel, wellness]
  )

  const insights = useMemo(
    () => computeInsights(filteredForInsights, activeFilter, periodRangeLabel),
    [filteredForInsights, activeFilter, periodRangeLabel]
  )

  const showLineChart = activeFilter !== "Harian"

  // BAGIAN 5: RENDER ANTARMUKA (UI)

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full bg-[#F4F7FC] min-h-screen">

      {/* : Menampilkan Nama Profil & Pemilih Tanggal*/}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">
            {"Halo, " + (profile.fullName?.split(" ")[0] || "Demo") + "!"}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Yuk jaga kebiasaan digitalmu hari ini.
          </p>
        </div>
        {/* Input kalender (hanya terlihat saat filter 'Harian' aktif) */}
        {activeFilter === "Harian" && (
          <div
            className="relative flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer group"
            onClick={() => datePickerRef.current?.showPicker()}
          >
            <IconCalendar className="size-4.5 text-slate-500" />
            <span>{formatHeaderDate(datePicker)}</span>
            <IconChevronDown className="size-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            <input
              ref={datePickerRef}
              type="date"
              value={datePicker}
              onChange={(e) => setDatePicker(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        )}
      </div>

      {/* TABS FILTER & NAVIGATOR PERIODE: Harian, Mingguan, Bulanan */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.label;
            return (
              <button
                key={filter.label}
                onClick={() => {
                  setActiveFilter(filter.label)
                  setWeekOffset(0)
                  setMonthOffset(0)
                }}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-200 shadow-sm"
                  }`}
              >
                <filter.icon className={`size-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Navigasi Panah (Kiri/Kanan) untuk Pindah Minggu */}
        {activeFilter === "Mingguan" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="flex size-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <IconChevronLeft className="size-4.5" />
            </button>
            <span className="text-sm font-bold text-slate-700 min-w-45 text-center">
              {formatWeekLabel(weekOffset)}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="flex size-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <IconChevronRight className="size-4.5" />
            </button>
          </div>
        )}

        {/* Navigasi Panah (Kiri/Kanan) untuk Pindah Bulan */}
        {activeFilter === "Bulanan" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              className="flex size-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <IconChevronLeft className="size-4.5" />
            </button>
            <span className="text-sm font-bold text-slate-700 min-w-40 text-center">
              {formatMonthLabel(monthOffset)}
            </span>
            <button
              onClick={() => setMonthOffset((o) => o + 1)}
              className="flex size-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <IconChevronRight className="size-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* STATS CARDS: Grid yang berisi 4 Kotak Ringkasan Data */}
      <div key={`stats-${activeFilter}`} className="grid grid-cols-1 gap-4 animate-fade-in-up sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] bg-white overflow-hidden flex flex-col">
            <CardContent className="p-4 xl:p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}>
                  <stat.icon className={`size-5 ${stat.iconColor}`} />
                </div>

                <div className="flex flex-col flex-1">
                  {stat.label === "Digital Wellness Score" ? (
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] xl:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconInfoCircle className="size-3.5 shrink-0 text-slate-300 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-50 text-center text-xs">
                            Skor kesehatan digitalmu berdasarkan proporsi belajar/kerja dan rata-rata screen time harian.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <p className="text-[10px] xl:text-[11px] font-bold text-slate-400 uppercase tracking-wider ">{stat.label}</p>
                  )}

                  <p className="text-lg xl:text-xl font-black text-slate-900 tracking-tight ">
                    {stat.value}
                  </p>
                </div>
              </div>

              <p className="text-[11px] xl:text-xs font-medium text-slate-500 leading-snug line-clamp-2">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS SECTION: Area Grafik (Donut & Line Chart) */}
      <div key={`charts-${activeFilter}`} className={`grid gap-5 animate-fade-in-up ${showLineChart ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* DONUT CHART: Grafik Lingkaran & Daftar Kategori */}
        <Card className="border-none rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] bg-white">
          <CardHeader className="pb-0 pt-7 px-8">
            <CardTitle className="text-lg font-extrabold text-slate-900">Penggunaan per Kategori</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 mt-1">{donutLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-8">

            {/* Kiri: SVG Donut Chart */}
            <div className="h-56 w-full md:w-[45%] flex justify-center shrink-0">
              {donutData.length > 0 ? (
                <ChartContainer config={donutChartConfig} className="h-full w-full max-w-64 aspect-square">
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                    />
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      strokeWidth={0}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-8 border-slate-50 bg-slate-50/50">
                  <span className="text-xs font-medium text-slate-400">Belum ada data</span>
                </div>
              )}
            </div>

            {/* Kanan: Custom Legend / Progress Bar Tiap Kategori */}
            <div className="w-full md:w-[55%] flex flex-col gap-4">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm w-full">
                  <div className="flex items-center gap-2.5 w-[35%] shrink-0">
                    <div className="size-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.fill }} />
                    <span className="font-bold text-slate-700 text-xs leading-tight">{item.name}</span>
                  </div>
                  <div className="w-[30%] px-3">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${item.percent}%`, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                  <div className="w-[15%] text-right font-extrabold text-xs" style={{ color: item.fill }}>
                    {item.percent}%
                  </div>
                  <div className="w-[20%] text-right font-semibold text-slate-500 text-xs">
                    {item.formattedTime}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LINE CHART: Grafik Tren (Hanya Tampil di Filter Mingguan/Bulanan) */}
        {showLineChart && (
          <Card className="border-none rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] bg-white">
            <CardHeader className="pb-4 pt-7 px-8">
              <CardTitle className="text-lg font-extrabold text-slate-900">Tren Screen Time</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                {periodRangeLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-56 w-full">
                <ChartContainer config={lineChartConfig} className="h-full w-full">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="screentime"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, stroke: "#fff", r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* INSIGHTS SECTION: Kotak Informasi & Kesimpulan Otomatis */}
      <div key={`insights-${activeFilter}`} className="flex flex-col gap-4 animate-fade-in-up mt-2">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-slate-900">
          Insight {activeFilter === "Harian" ? "Hari Ini" : periodRangeLabel}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card key={insight.title} className="border-none rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] bg-white">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${insight.iconBg}`}>
                  <insight.icon className={`size-6 ${insight.iconColor}`} />
                </div>
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <h3 className="text-sm font-extrabold text-slate-800">{insight.title}</h3>
                  <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                    {insight.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* TIPS SECTION */}
      <div className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 border border-amber-200/60 p-6 animate-fade-in-up mt-2">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 size-32 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-24 bg-orange-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          {/* Icon with glow ring */}
          <div className="relative shrink-0">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm border border-amber-200/50">
              <IconBulb className="size-6 text-amber-500" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md -z-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80">
              Tips Hari Ini
            </span>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {dailyTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}