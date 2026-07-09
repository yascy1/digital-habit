"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconArrowLeft,
  IconPlus,
  IconGhost,
  IconUsers,
  IconBook,
  IconDeviceGamepad2,
  IconDots,
  IconX,
  IconClock,
  IconCalendarEvent,
  IconInfoCircle,
  IconPencil,
  IconDeviceFloppy
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { saveActivities } from "@/lib/activities"
import type { Activity } from "@/lib/types"
import { toast } from "sonner"


// BAGIAN 1: KONFIGURASI DATA STATIS

const categories = [
  { id: "hiburan", label: "Hiburan", icon: IconGhost, theme: "text-purple-600 bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  { id: "media-sosial", label: "Media Sosial", icon: IconUsers, theme: "text-emerald-600 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  { id: "belajar-kerja", label: "Belajar / Kerja", icon: IconBook, theme: "text-blue-600 bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  { id: "gaming", label: "Gaming", icon: IconDeviceGamepad2, theme: "text-slate-600 bg-slate-100", badge: "bg-slate-100 text-slate-700" },
  { id: "lainnya", label: "Lainnya", icon: IconDots, theme: "text-slate-600 bg-slate-100", badge: "bg-slate-100 text-slate-700" },
]

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))


// BAGIAN 2: FUNGSI PEMBANTU (HELPER FUNCTIONS)
function formatDuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return "0 menit"
  if (hours === 0) return `${minutes} menit`
  if (minutes === 0) return `${hours} jam`
  return `${hours} jam ${minutes} menit`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}


// BAGIAN 3: KOMPONEN UTAMA

export default function InputAktivitasPage() {
  const router = useRouter()

  // --- STATE (Penyimpanan Data Sementara di Form) ---
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [durationHours, setDurationHours] = useState<string>("")
  const [durationMinutes, setDurationMinutes] = useState<string>("")

  const [date, setDate] = useState<string>("")

  const [notes, setNotes] = useState<string>("")
  const [pendingList, setPendingList] = useState<Activity[]>([])

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0])
  }, [])

  const totalPendingMinutes = useMemo(() => {

    // --- LOGIKA PERHITUNGAN ---
    return pendingList.reduce((acc, curr) => acc + (curr.durationHours * 60) + curr.durationMinutes, 0)
  }, [pendingList])

  const totalH = Math.floor(totalPendingMinutes / 60)
  const totalM = totalPendingMinutes % 60
  const totalTimeStr = totalPendingMinutes === 0 ? "0 menit" : `${totalH > 0 ? totalH + ' jam ' : ''}${totalM} menit`

  // --- FUNGSI AKSI (HANDLERS) ---
  const handleAdd = () => {
    if (!selectedCategory) {
      toast.error("Pilih kategori aktivitas terlebih dahulu.")
      return
    }

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

  const handleEdit = (activity: Activity) => {
    setSelectedCategory(activity.category)
    setDurationHours(activity.durationHours ? activity.durationHours.toString() : "")
    setDurationMinutes(activity.durationMinutes ? activity.durationMinutes.toString() : "")
    setDate(activity.date)
    setNotes(activity.notes || "")
    handleRemove(activity.id)
  }

  const handleSaveAll = () => {
    if (pendingList.length === 0) return
    saveActivities(pendingList)
    toast.success("Aktivitas tersimpan!")
    router.push("/riwayat")
  }

  // BAGIAN 4: RENDER ANTARMUKA (UI)
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">

      {/* HEADER: Tombol Kembali, Judul Halaman, dan Ringkasan Total Waktu */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors w-fit"
          >
            <IconArrowLeft className="size-4" stroke={2.5} />
            Kembali
          </Link>
          <div className="mt-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">
              Input Aktivitas
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Catat aktivitas digitalmu hari ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-60">
          <div className="flex size-11 items-center justify-center rounded-full bg-blue-600 text-white shrink-0 shadow-inner">
            <IconClock className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400">Total jam input hari ini</span>
            <span className="text-lg font-black text-slate-800">{totalTimeStr}</span>
          </div>
        </div>
      </div>


      {/* FORM INPUT UTAMA */}
      <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col gap-8">

          {/* Bagian 1: Pilih Kategori */}
          <div className="flex flex-col gap-3 pb-8 border-b border-slate-100">
            <label className="text-sm font-bold text-slate-800">Kategori Aktivitas</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all border ${selectedCategory === cat.id
                    ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <cat.icon className="size-4.5" stroke={selectedCategory === cat.id ? 2.5 : 2} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bagian 2: Input Durasi (Ada mode dropdown/Select dan mode ketik/Input) */}
          <div className="flex flex-col gap-3 pb-8 border-b border-slate-100">
            <label className="text-sm font-bold text-slate-800">Durasi</label>
            <div className="flex items-center gap-3">
              <Select value={durationHours} onValueChange={setDurationHours}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Jam" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Array.from({ length: 13 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i} jam
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Menit" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} menit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={23}
                className="w-24 rounded-xl border-slate-200 h-11 text-center font-semibold text-slate-800 text-base"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
              <span className="text-sm font-medium text-slate-500 mr-2">jam</span>
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={59}
                className="w-24 rounded-xl border-slate-200 h-11 text-center font-semibold text-slate-800 text-base"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
              <span className="text-sm font-medium text-slate-500">menit</span>
            </div>
          </div>
          {/* Bagian 3: Input Tanggal */}
          <div className="flex flex-col gap-3 pb-8 border-b border-slate-100">
            <label className="text-sm font-bold text-slate-800">Tanggal</label>
            <div className="relative w-full max-w-sm">
              <IconCalendarEvent className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
              <Input
                type="date"
                max={date}
                className="pl-11 rounded-xl border-slate-200 h-11 font-medium text-slate-700"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Bagian 4: Input Catatan Tambahan (Opsional) */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-800">
              Catatan <span className="text-slate-400 font-medium">(opsional)</span>
            </label>
            <Textarea
              placeholder="Tulis catatan tentang aktivitas ini..."
              rows={3}
              className="resize-none rounded-xl border-slate-200 p-4 text-sm text-slate-700 placeholder:text-slate-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 font-semibold shadow-sm transition-all active:scale-[0.98]"
              disabled={!selectedCategory}
              onClick={handleAdd}
            >
              <IconPlus className="size-4.5" stroke={2.5} />
              Tambah Aktivitas
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 rounded-2xl bg-blue-50/60 border border-blue-100 px-5 py-4 text-sm text-slate-600 shadow-sm mt-2">
        <IconInfoCircle className="size-5 text-blue-500 shrink-0" />
        <span className="font-medium">Pastikan data sudah benar sebelum disimpan.</span>
      </div>

      {/* DAFTAR AKTIVITAS YANG BELUM DISIMPAN (PENDING LIST) */}
      {pendingList.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Judul Daftar & Tombol Simpan Semua */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-base font-bold text-slate-800">
              Daftar Aktivitas Hari Ini ({pendingList.length})
            </h2>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 bg-white font-bold px-5"
              onClick={handleSaveAll}
            >
              <IconDeviceFloppy className="size-4.5" />
              Simpan Semua
            </Button>
          </div>
          {/* List/Daftar Kartu Aktivitas */}
          <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {pendingList.map((activity, index) => {
              const cat = categoryMap[activity.category] ?? categoryMap.lainnya
              const Icon = cat.icon
              return (
                <div
                  key={activity.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-slate-50 transition-colors ${index !== pendingList.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${cat.theme}`}>
                      <Icon className="size-7" stroke={1.5} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={`w-fit inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cat.badge}`}>
                        {cat.label}
                      </span>
                      {/* Detail Aktivitas (Label, Durasi, Tanggal, Catatan) */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <IconClock className="size-4 text-slate-400" />
                          {formatDuration(activity.durationHours, activity.durationMinutes)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IconCalendarEvent className="size-4 text-slate-400" />
                          {formatDate(activity.date)}
                        </div>
                      </div>
                      {/* Tampilkan catatan hanya jika diisi */}
                      {activity.notes && (
                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button
                      className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      onClick={() => handleEdit(activity)}
                      title="Edit"
                    >
                      <IconPencil className="size-4.5" stroke={2} />
                    </button>
                    <button
                      className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      onClick={() => handleRemove(activity.id)}
                      title="Hapus"
                    >
                      <IconX className="size-4.5" stroke={2} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}