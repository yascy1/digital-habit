"use client"

import { useState } from "react"
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

const filterData = {
  Harian: {
    stats: [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: "6j 30m",
        trend: "+10% dari kemarin",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: "72/100",
        trend: "+5 dari kemarin",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: IconMoon,
        label: "Penggunaan Malam",
        value: "2j 15m",
        trend: "-8% dari kemarin",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: "Media Sosial",
        trend: "42% waktu layar",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ],
    lineData: [
      { day: "Sen", screentime: 6.2 },
      { day: "Sel", screentime: 7.1 },
      { day: "Rab", screentime: 5.0 },
      { day: "Kam", screentime: 7.5 },
      { day: "Jum", screentime: 6.8 },
      { day: "Sab", screentime: 8.4 },
      { day: "Min", screentime: 5.3 },
    ],
    donutData: [
      { name: "Media Sosial", value: 42, fill: "var(--chart-1)" },
      { name: "Belajar/Kerja", value: 28, fill: "var(--chart-2)" },
      { name: "Hiburan", value: 15, fill: "var(--chart-3)" },
      { name: "Gaming", value: 10, fill: "var(--chart-4)" },
      { name: "Lainnya", value: 5, fill: "var(--chart-5)" },
    ],
    donutLabel: "Distribusi waktu hari ini",
    lineLabel: "7 hari terakhir",
    insights: [
      {
        icon: IconTrendingUp,
        title: "Penggunaan media sosial meningkat",
        description:
          "Penggunaan media sosialmu naik 18% hari ini. Pertimbangkan untuk mengatur batas waktu harian.",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconMoon,
        title: "Penggunaan malam cukup tinggi",
        description:
          "Kamu masih aktif menggunakan gadget hingga larut malam. Coba matikan notifikasi setelah jam 22:00.",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconCheck,
        title: "Konsistensi belajar/kerja baik",
        description:
          "Waktu belajar/kerja kamu hari ini mencapai 2 jam. Pertahankan pola ini!",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
    ],
  },
  Mingguan: {
    stats: [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: "42j 15m",
        trend: "+12% dari minggu lalu",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: "68/100",
        trend: "-4 dari minggu lalu",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: IconMoon,
        label: "Penggunaan Malam",
        value: "14j 30m",
        trend: "+15% dari minggu lalu",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: "Media Sosial",
        trend: "38% total waktu",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ],
    lineData: [
      { day: "Sen", screentime: 6.8 },
      { day: "Sel", screentime: 7.3 },
      { day: "Rab", screentime: 5.5 },
      { day: "Kam", screentime: 6.9 },
      { day: "Jum", screentime: 7.1 },
      { day: "Sab", screentime: 9.0 },
      { day: "Min", screentime: 8.2 },
    ],
    donutData: [
      { name: "Media Sosial", value: 38, fill: "var(--chart-1)" },
      { name: "Belajar/Kerja", value: 30, fill: "var(--chart-2)" },
      { name: "Hiburan", value: 17, fill: "var(--chart-3)" },
      { name: "Gaming", value: 10, fill: "var(--chart-4)" },
      { name: "Lainnya", value: 5, fill: "var(--chart-5)" },
    ],
    donutLabel: "Distribusi waktu minggu ini",
    lineLabel: "Rata-rata per hari minggu ini",
    insights: [
      {
        icon: IconTrendingUp,
        title: "Media sosial masih mendominasi",
        description:
          "Sepanjang minggu, media sosial menyumbang 38% waktu layar. Pertimbangkan untuk mengurangi scrolling.",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconMoon,
        title: "Penggunaan malam meningkat",
        description:
          "Waktu layar malam hari naik 15% dari minggu lalu. Usahakan untuk berhenti sebelum jam 22:00.",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconCheck,
        title: "Waktu belajar/kerja stabil",
        description:
          "Rata-rata belajar/kerja 3 jam per hari. Konsistensi yang baik, pertahankan!",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
    ],
  },
  Bulanan: {
    stats: [
      {
        icon: IconClock,
        label: "Total Screen Time",
        value: "168j 45m",
        trend: "+8% dari bulan lalu",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconHeart,
        label: "Digital Wellness Score",
        value: "65/100",
        trend: "-7 dari bulan lalu",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: IconMoon,
        label: "Penggunaan Malam",
        value: "58j 20m",
        trend: "+20% dari bulan lalu",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconDeviceMobile,
        label: "Aktivitas Terbanyak",
        value: "Belajar/Kerja",
        trend: "32% total waktu",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ],
    lineData: [
      { day: "Mg1", screentime: 42.5 },
      { day: "Mg2", screentime: 45.2 },
      { day: "Mg3", screentime: 39.8 },
      { day: "Mg4", screentime: 41.0 },
    ],
    donutData: [
      { name: "Media Sosial", value: 35, fill: "var(--chart-1)" },
      { name: "Belajar/Kerja", value: 32, fill: "var(--chart-2)" },
      { name: "Hiburan", value: 16, fill: "var(--chart-3)" },
      { name: "Gaming", value: 12, fill: "var(--chart-4)" },
      { name: "Lainnya", value: 5, fill: "var(--chart-5)" },
    ],
    donutLabel: "Distribusi waktu bulan ini",
    lineLabel: "Total per minggu bulan ini",
    insights: [
      {
        icon: IconTrendingUp,
        title: "Waktu layar bulanan tinggi",
        description:
          "Total 168 jam bulan ini, naik 8% dari bulan lalu. Pertimbangkan untuk menetapkan target bulanan.",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: IconMoon,
        title: "Penggunaan malam perlu diperhatikan",
        description:
          "58 jam penggunaan malam dalam sebulan. Ini bisa mengganggu kualitas tidur jangka panjang.",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: IconCheck,
        title: "Belajar/kerja jadi aktivitas terbanyak",
        description:
          "Pertama kalinya belajar/kerja mengalahkan media sosial. Pencapaian yang bagus!",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
    ],
  },
}

const filters = ["Harian", "Mingguan", "Bulanan"] as const

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Harian")
  const currentData =
    filterData[activeFilter as keyof typeof filterData] || filterData.Harian

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Halo, Tyas!
          </h1>
          <p className="text-sm text-muted-foreground">
            Ini ringkasan aktivitas digitalmu hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <input
            type="date"
            defaultValue="2026-06-17"
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
        {currentData.stats.map((stat) => (
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

      <div key={`charts-${activeFilter}`} className="grid grid-cols-1 gap-6 animate-fade-in-up lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Penggunaan per Kategori</CardTitle>
            <CardDescription>{currentData.donutLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
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
                    data={currentData.donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {currentData.donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Screen Time</CardTitle>
            <CardDescription>{currentData.lineLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={lineChartConfig} className="h-full w-full">
                <LineChart
                  data={currentData.lineData}
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
      </div>

      <div key={`insights-${activeFilter}`} className="flex flex-col gap-4 animate-fade-in-up">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Insight Hari Ini
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentData.insights.map((insight) => (
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
