"use client"

import { useState, useMemo } from "react"
import {
  IconClock,
  IconHeart,
  IconMoon,
  IconDeviceMobile,
  IconTrendingUp,
  IconCheck,
  IconCalendar,
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
  ChartLegend,
  ChartLegendContent,
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
import { getActivities, getProfile } from "@/lib/activities"
import type { Activity } from "@/lib/types"

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
    color: "var(--chart-1)",
  },
  "Belajar/Kerja": {
    label: "Belajar/Kerja",
    color: "var(--chart-2)",
  },
  Hiburan: {
    label: "Hiburan",
    color: "var(--chart-3)",
  },
  Gaming: {
    label: "Gaming",
    color: "var(--chart-4)",
  },
  Lainnya: {
    label: "Lainnya",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const categoryLabels: Record<string, string> = {
  "media-sosial": "Media Sosial",
  "belajar-kerja": "Belajar/Kerja",
  hiburan: "Hiburan",
  gaming: "Gaming",
  lainnya: "Lainnya",
}

const chartColors: Record<string, string> = {
  "Media Sosial": "var(--chart-1)",
  "Belajar/Kerja": "var(--chart-2)",
  Hiburan: "var(--chart-3)",
  Gaming: "var(--chart-4)",
  Lainnya: "var(--chart-5)",
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
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

function getDateRange(days: number): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push(makeDateStr(d))
  }
  return result
}

function getDateRangeOffset(days: number, offsetDays: number): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i - offsetDays)
    result.push(makeDateStr(d))
  }
  return result
}

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
  return `${h}j ${m}m`
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function getScreenTimeTrend(activities: Activity[], days: number) {
  const range = getDateRange(days)
  const grouped: Record<string, number> = {}
  for (const date of range) grouped[date] = 0

  for (const a of activities) {
    if (grouped[a.date] !== undefined) {
      grouped[a.date] += toMinutes(a)
    }
  }

  return range.map((date) => {
    const d = new Date(date + "T00:00:00")
    return {
      day: days <= 7 ? dayNames[d.getDay()] : formatDate(date),
      screentime: grouped[date],
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

  return Object.entries(catMinutes)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      fill: chartColors[name] ?? "var(--chart-5)",
    }))
}

function computeStats(allActivities: Activity[], period: string, datePicker: string) {
  const periodDays = period === "Harian" ? 1 : period === "Mingguan" ? 7 : 30
  const periodLabel = period === "Harian" ? "kemarin" : period === "Mingguan" ? "minggu lalu" : "bulan lalu"

  const currentDates = period === "Harian"
    ? [datePicker]
    : getDateRange(periodDays)
  const previousDates = period === "Harian"
    ? [makeDateStr(new Date(new Date(datePicker + "T00:00:00").getTime() - 86400000))]
    : getDateRangeOffset(periodDays, periodDays)

  const current = filterActivities(allActivities, currentDates)
  const previous = filterActivities(allActivities, previousDates)

  const currentTotal = sumMinutes(current)
  const previousTotal = sumMinutes(previous)

  const currentCatMinutes: Record<string, number> = {}
  for (const a of current) {
    const label = categoryLabels[a.category] ?? "Lainnya"
    currentCatMinutes[label] = (currentCatMinutes[label] ?? 0) + toMinutes(a)
  }
  const previousCatMinutes: Record<string, number> = {}
  for (const a of previous) {
    const label = categoryLabels[a.category] ?? "Lainnya"
    previousCatMinutes[label] = (previousCatMinutes[label] ?? 0) + toMinutes(a)
  }

  const sorted = Object.entries(currentCatMinutes).sort((a, b) => b[1] - a[1])
  const topCat = sorted[0]
  const topCatLabel = topCat ? topCat[0] : "-"
  const topCatPercent = currentTotal > 0 && topCat ? Math.round((topCat[1] / currentTotal) * 100) : 0

  const currentBelajar = currentCatMinutes["Belajar/Kerja"] ?? 0
  const previousBelajar = previousCatMinutes["Belajar/Kerja"] ?? 0
  const currentWellness = currentTotal > 0 ? Math.round((currentBelajar / currentTotal) * 100) : 0
  const previousWellness = previousTotal > 0 ? Math.round((previousBelajar / previousTotal) * 100) : 0

  const currentAvg = periodDays > 0 ? Math.round(currentTotal / periodDays) : 0
  const previousAvg = periodDays > 0 ? Math.round(previousTotal / periodDays) : 0

  const pctScreenTime = percentChange(currentTotal, previousTotal)
  const pctAvg = percentChange(currentAvg, previousAvg)

  let wellnessTrend: string
  if (previousTotal === 0) {
    wellnessTrend = "Belum ada data pembanding"
  } else if (currentWellness > previousWellness) {
    wellnessTrend = `Membaik dari ${periodLabel}`
  } else if (currentWellness < previousWellness) {
    wellnessTrend = `Menurun dari ${periodLabel}`
  } else {
    wellnessTrend = `Stabil dari ${periodLabel}`
  }

  return {
    stats: [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: currentTotal > 0 ? formatMinutes(currentTotal) : "0j 0m",
        trend: previousTotal === 0
          ? "Belum ada data pembanding"
          : `${pctScreenTime !== null && pctScreenTime >= 0 ? "▲" : "▼"} ${Math.abs(pctScreenTime ?? 0)}% dari ${periodLabel}`,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: currentTotal === 0 ? "-" : `${currentWellness}/100`,
        trend: wellnessTrend,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: IconMoon,
        label: "Rata-rata / Hari",
        value: currentTotal > 0 ? formatMinutes(currentAvg) : "0j 0m",
        trend: previousTotal === 0
          ? "Belum ada data pembanding"
          : `${pctAvg !== null && pctAvg >= 0 ? "▲" : "▼"} ${Math.abs(pctAvg ?? 0)}% dari ${periodLabel}`,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: topCatLabel,
        trend: `${topCatPercent}% waktu layar`,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ],
    donutData: computeDonutData(current),
    donutLabel:
      period === "Harian"
        ? "Distribusi waktu hari ini"
        : period === "Mingguan"
          ? "Distribusi 7 hari terakhir"
          : "Distribusi 30 hari terakhir",
  }
}

function computeInsights(activities: Activity[], period: string) {
  if (activities.length === 0) {
    return [
      {
        icon: IconTrendingUp,
        title: "Belum ada data",
        description: "Mulai catat aktivitas digitalmu untuk melihat insight.",
        iconBg: "bg-blue-100",
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

  const insights = [
    {
      icon: IconTrendingUp,
      title: `${topCat[0]} mendominasi`,
      description: `${topCat[0]} menyumbang ${topPercent}% total waktu layarmu ${period === "Harian" ? "hari ini" : `dalam ${period.toLowerCase()}`}.`,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ]

  if (sorted.length > 1) {
    const second = sorted[1]
    const secondPercent = totalMin > 0 ? Math.round((second[1] / totalMin) * 100) : 0
    insights.push({
      icon: IconCheck,
      title: `${second[0]} di posisi kedua`,
      description: `${second[0]} mencapai ${secondPercent}% dari total waktu layar.`,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    })
  }

  const uniqueDays = new Set(activities.map((a) => a.date)).size
  const avgMin = uniqueDays > 0 ? Math.round(totalMin / uniqueDays) : 0
  if (avgMin > 360) {
    insights.push({
      icon: IconMoon,
      title: "Screen time cukup tinggi",
      description: `Rata-rata ${Math.floor(avgMin / 60)}j ${avgMin % 60}m per hari. Pertimbangkan untuk mengurangi waktu layar.`,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    })
  } else {
    insights.push({
      icon: IconHeart,
      title: "Screen time terkendali",
      description: `Rata-rata ${Math.floor(avgMin / 60)}j ${avgMin % 60}m per hari. Pertahankan pola ini!`,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    })
  }

  return insights
}

const filters = ["Harian", "Mingguan", "Bulanan"] as const

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Harian")
  const [activities] = useState<Activity[]>(() => getActivities())
  const profile = getProfile()
  const [datePicker, setDatePicker] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  const lineData = useMemo(() => {
    if (activeFilter === "Harian") return []
    const days = activeFilter === "Mingguan" ? 7 : 30
    return getScreenTimeTrend(activities, days)
  }, [activities, activeFilter])

  const { stats, donutData, donutLabel } = useMemo(
    () => computeStats(activities, activeFilter, datePicker),
    [activities, activeFilter, datePicker]
  )

  const filteredForInsights = useMemo(() => {
    if (activeFilter === "Harian") {
      return activities.filter((a) => a.date === datePicker)
    }
    const days = activeFilter === "Mingguan" ? 7 : 30
    const range = getDateRange(days)
    return activities.filter((a) => range.includes(a.date))
  }, [activities, activeFilter, datePicker])

  const insights = useMemo(
    () => computeInsights(filteredForInsights, activeFilter),
    [filteredForInsights, activeFilter]
  )

  const showLineChart = activeFilter !== "Harian"

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {"Halo, " + (profile.fullName?.split(" ")[0] || "Pengguna") + "!"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ini ringkasan aktivitas digitalmu.
          </p>
        </div>
        {activeFilter === "Harian" && (
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <IconCalendar className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={datePicker}
              onChange={(e) => setDatePicker(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div key={`stats-${activeFilter}`} className="grid grid-cols-1 gap-4 animate-fade-in-up sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <stat.icon className={`size-5 ${stat.iconColor}`} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div key={`charts-${activeFilter}`} className={`grid gap-6 animate-fade-in-up ${showLineChart ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <Card>
          <CardHeader>
            <CardTitle>Penggunaan per Kategori</CardTitle>
            <CardDescription>{donutLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ChartContainer config={donutChartConfig} className="h-full w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {showLineChart && (
          <Card>
            <CardHeader>
              <CardTitle>Tren Screen Time</CardTitle>
              <CardDescription>
                {activeFilter === "Mingguan"
                  ? "7 hari terakhir"
                  : "30 hari terakhir"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ChartContainer config={lineChartConfig} className="h-full w-full">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="screentime"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div key={`insights-${activeFilter}`} className="flex flex-col gap-4 animate-fade-in-up">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Insight
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card key={insight.title}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${insight.iconBg}`}
                  >
                    <insight.icon className={`size-5 ${insight.iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold">{insight.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
