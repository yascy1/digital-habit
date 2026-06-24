"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  IconClock,
  IconHeart,
  IconDeviceMobile,
  IconTrendingUp,
  IconCheck,
  IconCalendar,
  IconPlus,
  IconInfoCircle,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { getActivities } from "@/lib/activities"
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

const categoryColors: Record<string, string> = {
  "media-sosial": "var(--chart-1)",
  "belajar-kerja": "var(--chart-2)",
  hiburan: "var(--chart-3)",
  gaming: "var(--chart-4)",
  lainnya: "var(--chart-5)",
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function totalMinutes(acts: Activity[]): number {
  return acts.reduce((sum, a) => sum + a.durationHours * 60 + a.durationMinutes, 0)
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0 && m === 0) return "0m"
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}j`
  return `${h}j ${m}m`
}

function filterByPeriod(acts: Activity[], period: string): Activity[] {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  if (period === "Harian") {
    return acts.filter((a) => a.date === today)
  }

  if (period === "Mingguan") {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const cutoff = weekAgo.toISOString().split("T")[0]
    return acts.filter((a) => a.date >= cutoff)
  }

  if (period === "Bulanan") {
    const monthAgo = new Date(now)
    monthAgo.setDate(monthAgo.getDate() - 30)
    const cutoff = monthAgo.toISOString().split("T")[0]
    return acts.filter((a) => a.date >= cutoff)
  }

  return acts
}

function categoryDistribution(acts: Activity[]): { name: string; value: number; fill: string }[] {
  if (acts.length === 0) return []

  const totals: Record<string, number> = {}
  for (const a of acts) {
    const mins = a.durationHours * 60 + a.durationMinutes
    totals[a.category] = (totals[a.category] || 0) + mins
  }

  const totalMins = Object.values(totals).reduce((s, v) => s + v, 0)
  if (totalMins === 0) return []

  return Object.entries(totals)
    .map(([cat, mins]) => ({
      name: categoryLabels[cat] || cat,
      value: Math.round((mins / totalMins) * 100),
      fill: categoryColors[cat] || "var(--chart-5)",
    }))
    .sort((a, b) => b.value - a.value)
}

function getScreenTimeTrend(acts: Activity[], days: number): { day: string; screentime: number }[] {
  const now = new Date()
  const result: { day: string; screentime: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const dayActs = acts.filter((a) => a.date === dateStr)

    let label: string
    if (days <= 7) {
      label = dayNames[d.getDay()]
    } else {
      label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
    }

    result.push({
      day: label,
      screentime: parseFloat((totalMinutes(dayActs) / 60).toFixed(1)),
    })
  }
  return result
}

function generateInsights(acts: Activity[], period: string): { title: string; description: string; iconBg: string; iconColor: string; icon: typeof IconTrendingUp }[] {
  const insights: { title: string; description: string; iconBg: string; iconColor: string; icon: typeof IconTrendingUp }[] = []

  if (acts.length === 0) {
    insights.push({
      title: "Belum ada aktivitas",
      description: `Mulai catat aktivitas digitalmu${period === "Harian" ? " hari ini" : ` untuk ${period.toLowerCase()}`} untuk melihat insight.`,
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      icon: IconInfoCircle,
    })
    return insights
  }

  const dist = categoryDistribution(acts)
  const topCat = dist[0]
  const totalMins = totalMinutes(acts)
  const totalHours = totalMins / 60

  if (topCat && topCat.value >= 40) {
    insights.push({
      title: `${topCat.name} mendominasi`,
      description: `${topCat.name} menyumbang ${topCat.value}% total waktu. Pertimbangkan untuk mengurangi.`,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: IconTrendingUp,
    })
  }

  const belajarMins = acts
    .filter((a) => a.category === "belajar-kerja")
    .reduce((s, a) => s + a.durationHours * 60 + a.durationMinutes, 0)

  if (belajarMins > 0) {
    const belajarHours = belajarMins / 60
    insights.push({
      title: "Waktu belajar/kerja",
      description: `Kamu sudah ${formatMinutes(belajarMins)} untuk belajar/kerja. Pertahankan!`,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: IconCheck,
    })
  }

  if (totalHours >= 8) {
    insights.push({
      title: "Screen time cukup tinggi",
      description: `Total ${formatMinutes(totalMins)} waktu layar. Coba alokasikan waktu untuk istirahat.`,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: IconClock,
    })
  }

  return insights
}

const filters = ["Harian", "Mingguan", "Bulanan"] as const

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Harian")

  const userName = useMemo(() => {
    if (typeof window === "undefined") return "Kamu"
    try {
      const session = JSON.parse(localStorage.getItem("digital-habit-user") ?? "{}")
      return session.name || "Kamu"
    } catch {
      return "Kamu"
    }
  }, [])

  const activities = useMemo(() => getActivities(), [])
  const filtered = useMemo(() => filterByPeriod(activities, activeFilter), [activities, activeFilter])

  const stats = useMemo(() => {
    const totalMins = totalMinutes(filtered)
    const belajarMins = filtered
      .filter((a) => a.category === "belajar-kerja")
      .reduce((s, a) => s + a.durationHours * 60 + a.durationMinutes, 0)
    const wellnessScore = totalMins > 0 ? Math.min(100, Math.round((belajarMins / totalMins) * 100 + 30)) : 0
    const dist = categoryDistribution(filtered)
    const topCat = dist[0]

    return [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: formatMinutes(totalMins),
        trend: `${filtered.length} aktivitas tercatat`,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: `${wellnessScore}/100`,
        trend: wellnessScore >= 70 ? "Kamu sudah sehat!" : "Tingkatkan waktu belajar",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: topCat ? topCat.name : "-",
        trend: topCat ? `${topCat.value}% waktu layar` : "Belum ada data",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        icon: IconTrendingUp,
        label: "Rata-rata per Aktivitas",
        value: filtered.length > 0 ? formatMinutes(Math.round(totalMins / filtered.length)) : "0m",
        trend: `${filtered.length} aktivitas`,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    ]
  }, [filtered])

  const donutData = useMemo(() => categoryDistribution(filtered), [filtered])
  const lineData = useMemo(() => {
    if (activeFilter === "Harian") return []
    const days = activeFilter === "Mingguan" ? 7 : 30
    return getScreenTimeTrend(activities, days)
  }, [activities, activeFilter])
  const insights = useMemo(() => generateInsights(filtered, activeFilter), [filtered, activeFilter])

  const donutLabel = activeFilter === "Harian" ? "Distribusi waktu hari ini"
    : activeFilter === "Mingguan" ? "Distribusi waktu 7 hari terakhir"
    : "Distribusi waktu 30 hari terakhir"

  const lineLabel = activeFilter === "Mingguan" ? "Tren 7 hari terakhir" : "Tren 30 hari terakhir"

  const today = new Date().toISOString().split("T")[0]

  if (activities.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Halo, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang di Digital Habit.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <IconPlus className="size-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Belum ada aktivitas</h2>
              <p className="text-sm text-muted-foreground">
                Mulai catat aktivitas digitalmu pertama kali untuk melihat dashboard ini.
              </p>
            </div>
            <Link href="/input-aktivitas">
              <Button className="gap-2">
                <IconPlus className="size-4" />
                Input Aktivitas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Halo, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Ini ringkasan aktivitas digitalmu{activeFilter === "Harian" ? " hari ini" : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <input
            type="date"
            defaultValue={today}
            className="bg-transparent text-sm outline-none"
          />
        </div>
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

      <div key={`charts-${activeFilter}`} className={`grid grid-cols-1 gap-6 animate-fade-in-up ${activeFilter !== "Harian" ? "lg:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader>
            <CardTitle>Penggunaan per Kategori</CardTitle>
            <CardDescription>{donutLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {donutData.length > 0 ? (
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
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Belum ada data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {activeFilter !== "Harian" && (
          <Card>
            <CardHeader>
              <CardTitle>Tren Screen Time</CardTitle>
              <CardDescription>{lineLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {lineData.length > 0 ? (
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
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Belum ada data
                  </div>
                )}
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
