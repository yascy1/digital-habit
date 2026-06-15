"use client"

import {
  Clock,
  Target,
  Smartphone,
  Timer,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const weeklyData = [
  { day: "Sen", screenTime: 5.2 },
  { day: "Sel", screenTime: 6.8 },
  { day: "Rab", screenTime: 4.5 },
  { day: "Kam", screenTime: 7.1 },
  { day: "Jum", screenTime: 6.3 },
  { day: "Sab", screenTime: 8.2 },
  { day: "Min", screenTime: 6.7 },
]

const categoryData = [
  { name: "Media Sosial", value: 42, fill: "var(--chart-1)" },
  { name: "Belajar/Kerja", value: 28, fill: "var(--chart-2)" },
  { name: "Hiburan", value: 18, fill: "var(--chart-3)" },
  { name: "Lainnya", value: 12, fill: "var(--chart-4)" },
]

const lineChartConfig = {
  screenTime: {
    label: "Screen Time (jam)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const pieChartConfig = {
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
  Lainnya: {
    label: "Lainnya",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const stats = [
  {
    icon: Clock,
    label: "Total Screen Time",
    value: "6h 42m",
    trend: "+12%",
    trendLabel: "vs kemarin",
    trendUp: true,
  },
  {
    icon: Target,
    label: "Skor Produktivitas",
    value: "78/100",
    trend: "+5%",
    trendLabel: "minggu ini",
    trendUp: true,
  },
  {
    icon: Smartphone,
    label: "Pergantian Aplikasi",
    value: "147",
    trend: "-8%",
    trendLabel: "vs kemarin",
    trendUp: false,
  },
  {
    icon: Timer,
    label: "Waktu Fokus",
    value: "3h 15m",
    trend: "+20%",
    trendLabel: "vs kemarin",
    trendUp: true,
  },
]

const insights = [
  {
    icon: AlertTriangle,
    title: "Waktu Layar Meningkat",
    description:
      "Waktu layar kamu meningkat 12% dibanding kemarin. Coba kurangi scrolling di malam hari untuk tidur yang lebih berkualitas.",
    variant: "warning" as const,
  },
  {
    icon: CheckCircle,
    title: "Fokus Meningkat",
    description:
      "Kamu sudah fokus selama 3 jam 15 menit hari ini. Bagus! Pertahankan pola ini untuk produktivitas yang lebih baik.",
    variant: "success" as const,
  },
  {
    icon: Info,
    title: "Dominasi Media Sosial",
    description:
      "Instagram dan TikTok menyumbang 42% waktu layar. Pertimbangkan untuk menetapkan batas waktu harian di aplikasi ini.",
    variant: "info" as const,
  },
  {
    icon: Lightbulb,
    title: "Tips Produktif",
    description:
      "Coba gunakan teknik Pomodoro: 25 menit fokus, 5 menit istirahat. Ini bisa meningkatkan waktu fokus kamu hingga 40%.",
    variant: "tip" as const,
  },
]

const insightVariantStyles = {
  warning: "border-l-yellow-500 bg-yellow-500/5",
  success: "border-l-green-500 bg-green-500/5",
  info: "border-l-blue-500 bg-blue-500/5",
  tip: "border-l-purple-500 bg-purple-500/5",
}

const insightIconStyles = {
  warning: "text-yellow-500",
  success: "text-green-500",
  info: "text-blue-500",
  tip: "text-purple-500",
}

const totalPercentage = categoryData.reduce((sum, item) => sum + item.value, 0)

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas digital hari ini
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <stat.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={stat.trendUp ? "default" : "secondary"}
                  className="gap-1"
                >
                  {stat.trendUp ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {stat.trend}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stat.trendLabel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Screen Time</CardTitle>
            <CardDescription>7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={lineChartConfig} className="h-full w-full">
                <LineChart
                  data={weeklyData}
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
                    dataKey="screenTime"
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

        <Card>
          <CardHeader>
            <CardTitle>Penggunaan per Kategori</CardTitle>
            <CardDescription>Distribusi waktu hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={pieChartConfig} className="h-full w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalPercentage}%
              </span>
              <span>total penggunaan</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insight & Kesimpulan</CardTitle>
          <CardDescription>
            Analisis kebiasaan digital kamu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {insights.map((insight, index) => (
              <div key={insight.title}>
                {index > 0 && <Separator className="mb-4" />}
                <div
                  className={`flex gap-4 rounded-lg border-l-4 p-4 ${insightVariantStyles[insight.variant]}`}
                >
                  <insight.icon
                    className={`mt-0.5 size-5 shrink-0 ${insightIconStyles[insight.variant]}`}
                  />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
