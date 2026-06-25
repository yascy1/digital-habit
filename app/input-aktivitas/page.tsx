"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconSocial,
  IconBook,
  IconDeviceGamepad2,
  IconDots,
  IconSchool,
  IconX,
  IconClock,
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { saveActivities } from "@/lib/activities"
import type { Activity } from "@/lib/types"

const categories = [
  { id: "media-sosial", label: "Media Sosial", icon: IconSocial },
  { id: "belajar-kerja", label: "Belajar/Kerja", icon: IconBook },
  { id: "hiburan", label: "Hiburan", icon: IconSchool },
  { id: "gaming", label: "Gaming", icon: IconDeviceGamepad2 },
  { id: "lainnya", label: "Lainnya", icon: IconDots },
]

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

function formatDuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return "0m"
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}j`
  return `${hours}j ${minutes}m`
}

export default function InputAktivitasPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [durationHours, setDurationHours] = useState<string>("")
  const [durationMinutes, setDurationMinutes] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState<string>("")
  const [pendingList, setPendingList] = useState<Activity[]>([])

  const handleAdd = () => {
    if (!selectedCategory) return

    setPendingList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: selectedCategory,
        durationHours: parseInt(durationHours) || 0,
        durationMinutes: parseInt(durationMinutes) || 0,
        date,
        notes,
        createdAt: Date.now(),
      },
    ])

    setSelectedCategory("")
    setDurationHours("")
    setDurationMinutes("")
    setNotes("")
  }

  const handleRemove = (id: string) => {
    setPendingList((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSaveAll = () => {
    if (pendingList.length === 0) return
    saveActivities(pendingList)
    router.push("/riwayat")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          Kembali
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Input Aktivitas
        </h1>
        <p className="text-sm text-muted-foreground">
          Catat aktivitas digitalmu. Tambahkan beberapa aktivitas lalu simpan sekaligus.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Kategori Aktivitas</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <cat.icon className="size-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Durasi</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={23}
                    className="w-20"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">jam</span>
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={59}
                    className="w-20"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">menit</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Catatan <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <Textarea
                placeholder="Tambahkan catatan tentang aktivitas ini..."
                rows={2}
                className="resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={!selectedCategory}
                onClick={handleAdd}
              >
                <IconPlus className="size-4" />
                Tambah
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {pendingList.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Daftar Aktivitas ({pendingList.length})
            </h2>
            <Button size="sm" className="gap-2" onClick={handleSaveAll}>
              <IconDeviceFloppy className="size-4" />
              Simpan Semua
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {pendingList.map((activity) => {
              const cat = categoryMap[activity.category] ?? categoryMap.lainnya
              const Icon = cat.icon
              return (
                <Card key={activity.id}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary">{cat.label}</Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IconClock className="size-3" />
                            {formatDuration(activity.durationHours, activity.durationMinutes)}
                          </div>
                          {activity.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(activity.id)}
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
