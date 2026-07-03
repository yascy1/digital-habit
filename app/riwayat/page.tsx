"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import {
  IconEye,
  IconFilter,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconHistory,
  IconPlus,
  IconPencil,
  IconTrash,
  IconDeviceFloppy,
  IconSocial,
  IconBook,
  IconDeviceGamepad2,
  IconDots,
  IconSchool,
  IconDownload,
  IconX, // Tambahan IconX untuk badge filter
} from "@tabler/icons-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Activity } from "@/lib/types"
import {
  getActivities,
  getProfile,
  saveActivity,
  updateActivity,
  deleteActivity as deleteActivityFn,
} from "@/lib/activities"
import { updateStreak } from "@/lib/streak"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ... (Seluruh variabel konstan di atas tetap sama: categoryBadgeStyles, dll.)
const categoryBadgeStyles: Record<string, string> = {
  "media-sosial": "bg-orange-100 text-orange-700",
  "belajar-kerja": "bg-green-100 text-green-700",
  hiburan: "bg-purple-100 text-purple-700",
  gaming: "bg-red-100 text-red-700",
  lainnya: "bg-gray-100 text-gray-700",
}

const categoryLabels: Record<string, string> = {
  "media-sosial": "Media Sosial",
  "belajar-kerja": "Belajar / Kerja",
  hiburan: "Hiburan",
  gaming: "Gaming",
  lainnya: "Lainnya",
}

function formatTotalDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0 && minutes === 0) return "0 menit"
  if (hours === 0) return `${minutes} menit`
  if (minutes === 0) return `${hours} jam`
  return `${hours} jam ${minutes} menit`
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateId(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" })
}

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

interface DaySummary {
  date: string
  totalMinutes: number
  dominantCategory: string
  categoryMinutes: Record<string, number>
}

function computeDaySummaries(activities: Activity[]): DaySummary[] {
  const grouped: Record<string, Activity[]> = {}
  for (const a of activities) {
    ; (grouped[a.date] ??= []).push(a)
  }

  return Object.entries(grouped)
    .map(([date, acts]) => {
      const categoryMinutes: Record<string, number> = {}
      let totalMinutes = 0

      for (const a of acts) {
        const mins = a.durationHours * 60 + a.durationMinutes
        totalMinutes += mins
        categoryMinutes[a.category] = (categoryMinutes[a.category] ?? 0) + mins
      }

      let dominantCategory = "lainnya"
      let maxMins = 0
      for (const [cat, mins] of Object.entries(categoryMinutes)) {
        if (mins > maxMins) {
          maxMins = mins
          dominantCategory = cat
        }
      }

      return { date, totalMinutes, dominantCategory, categoryMinutes }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

const ROWS_OPTIONS = [5, 10, 15, 20]

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "media-sosial": IconSocial,
  "belajar-kerja": IconBook,
  hiburan: IconSchool,
  gaming: IconDeviceGamepad2,
  lainnya: IconDots,
}

export default function RiwayatPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [showFilterPopover, setShowFilterPopover] = useState(false)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [draftDateFrom, setDraftDateFrom] = useState<string>("")
  const [draftDateTo, setDraftDateTo] = useState<string>("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null)
  const [selectedDayActivities, setSelectedDayActivities] = useState<Activity[]>([])
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editCategory, setEditCategory] = useState("")
  const [editHours, setEditHours] = useState("")
  const [editMinutes, setEditMinutes] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addCategory, setAddCategory] = useState("")
  const [addHours, setAddHours] = useState("")
  const [addMinutes, setAddMinutes] = useState("")
  const [addNotes, setAddNotes] = useState("")
  const [exportOpen, setExportOpen] = useState(false)
  const [exportMode, setExportMode] = useState<"filtered" | "custom">("filtered")
  const [exportDateFrom, setExportDateFrom] = useState("")
  const [exportDateTo, setExportDateTo] = useState("")
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFilterPopover) return
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterPopover(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showFilterPopover])


  function startEdit(activity: Activity) {
    setEditingActivity(activity)
    setEditCategory(activity.category)
    setEditHours(String(activity.durationHours || ""))
    setEditMinutes(String(activity.durationMinutes || ""))
    setEditNotes(activity.notes)
  }

  function handleSaveEdit() {
    if (!editingActivity) return
    const updated: Activity = {
      ...editingActivity,
      category: editCategory,
      durationHours: parseInt(editHours) || 0,
      durationMinutes: parseInt(editMinutes) || 0,
      notes: editNotes,
    }
    updateActivity(updated)
    setActivities(getActivities())
    setSelectedDayActivities((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    )
    setEditingActivity(null)
  }

  function handleDeleteActivity(id: string) {
    deleteActivityFn(id)

    const remaining = getActivities()
    setActivities(remaining)
    setSelectedDayActivities((prev) => prev.filter((a) => a.id !== id))

    // Update streak setelah hapus aktivitas
    updateStreak()
  }

  function handleAddActivity() {
    if (!addCategory || !selectedDay) return
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      category: addCategory,
      durationHours: parseInt(addHours) || 0,
      durationMinutes: parseInt(addMinutes) || 0,
      date: selectedDay.date,
      notes: addNotes,
      createdAt: Date.now(),
    }
    saveActivity(newActivity)
    updateStreak()
    setActivities(getActivities())
    setSelectedDayActivities((prev) => [...prev, newActivity])
    setAddCategory("")
    setAddHours("")
    setAddMinutes("")
    setAddNotes("")
    setIsAdding(false)
  }

  function handleExportPDF() {
    const allActivities = getActivities()

    let filtered: typeof allActivities
    let fromDisplay: string
    let toDisplay: string
    let fileNameDate: string

    if (exportMode === "filtered") {
      filtered = allActivities
      if (filtered.length === 0) {
        toast.error("Tidak ada data riwayat untuk diekspor.")
        return
      }
      const dates = filtered.map((a) => a.date).sort()
      fromDisplay = formatDateId(new Date(dates[0] + "T00:00:00"))
      toDisplay = formatDateId(new Date(dates[dates.length - 1] + "T00:00:00"))
      fileNameDate = "semua"
    } else {
      if (!exportDateFrom || !exportDateTo) {
        toast.error("Pilih tanggal mulai dan tanggal akhir terlebih dahulu.")
        return
      }
      if (exportDateFrom > exportDateTo) {
        toast.error("Tanggal mulai tidak boleh setelah tanggal akhir.")
        return
      }
      filtered = allActivities.filter(
        (a) => a.date >= exportDateFrom && a.date <= exportDateTo
      )
      if (filtered.length === 0) {
        toast.error("Tidak ada data pada rentang tanggal ini")
        return
      }
      fromDisplay = formatDateId(new Date(exportDateFrom + "T00:00:00"))
      toDisplay = formatDateId(new Date(exportDateTo + "T00:00:00"))
      fileNameDate = `${exportDateFrom}_${exportDateTo}`
    }

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
    const profile = getProfile()
    const userName = profile.fullName || profile.name || "-"
    const now = new Date()

    let totalMinutes = 0
    const categoryMinutes: Record<string, number> = {}
    for (const a of sorted) {
      const mins = a.durationHours * 60 + a.durationMinutes
      totalMinutes += mins
      categoryMinutes[a.category] = (categoryMinutes[a.category] ?? 0) + mins
    }

    let dominantCategory = "lainnya"
    let maxMins = 0
    for (const [cat, mins] of Object.entries(categoryMinutes)) {
      if (mins > maxMins) {
        maxMins = mins
        dominantCategory = cat
      }
    }

    const totalH = Math.floor(totalMinutes / 60)
    const totalM = totalMinutes % 60
    const totalDurasiStr = `${totalH}j ${totalM}m`
    const totalEntriStr = String(sorted.length)
    const kategoriDominanStr = categoryLabels[dominantCategory] ?? "Lainnya"

    const timestampStr = formatTimestamp(now)

    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Digital Habit", margin, 20)

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text("Laporan riwayat aktivitas screen time", margin, 28)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Nama: ${userName}`, margin, 37)
    doc.text(`Rentang: ${fromDisplay} - ${toDisplay}`, margin, 43)
    doc.text(`Dicetak: ${timestampStr}`, margin, 49)

    const boxY = 56
    const boxH = 18
    const boxW = (pageWidth - margin * 2 - 8) / 3
    const boxes = [
      { label: "Total durasi", value: totalDurasiStr },
      { label: "Total entri", value: totalEntriStr },
      { label: "Kategori dominan", value: kategoriDominanStr },
    ]
    boxes.forEach((box, i) => {
      const x = margin + i * (boxW + 4)
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(x, boxY, boxW, boxH, 2, 2, "F")
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120, 120, 120)
      doc.text(box.label, x + 4, boxY + 6)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 30, 30)
      doc.text(box.value, x + 4, boxY + 13)
    })

    const tableStartY = boxY + boxH + 10

    autoTable(doc, {
      startY: tableStartY,
      head: [["Tanggal", "Kategori", "Durasi", "Catatan"]],
      body: sorted.map((a) => [
        formatShortDate(a.date),
        categoryLabels[a.category] ?? a.category,
        `${a.durationHours}j ${a.durationMinutes}m`,
        a.notes || "-",
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 35 },
        2: { cellWidth: 22 },
        3: { cellWidth: "auto", overflow: "linebreak" },
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text(
          `Halaman ${data.pageNumber} dari ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        )
      },
    })

    const fileName = `riwayat_${fileNameDate}.pdf`
    doc.save(fileName)
    toast.success("PDF berhasil diunduh!")
    setExportOpen(false)
  }

  useEffect(() => {
    setActivities(getActivities())
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (dateFrom && a.date < dateFrom) return false
      if (dateTo && a.date > dateTo) return false
      return true
    })
  }, [activities, dateFrom, dateTo])

  const summaries = useMemo(
    () => computeDaySummaries(filteredActivities),
    [filteredActivities]
  )

  const exportPreview = useMemo(() => {
    if (exportMode === "filtered") {
      if (activities.length === 0) return null
      const dates = activities.map((a) => a.date).sort()
      return { count: activities.length, from: formatMonthYear(dates[0]), to: formatMonthYear(dates[dates.length - 1]) }
    }
    if (!exportDateFrom || !exportDateTo) return null
    const filtered = activities.filter((a) => a.date >= exportDateFrom && a.date <= exportDateTo)
    return { count: filtered.length, from: formatMonthYear(exportDateFrom), to: formatMonthYear(exportDateTo) }
  }, [exportMode, exportDateFrom, exportDateTo, activities])

  const totalPages = Math.max(1, Math.ceil(summaries.length / rowsPerPage))
  const safePage = Math.min(page, totalPages)
  const pagedSummaries = summaries.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  )

  const startItem = summaries.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
  const endItem = Math.min(safePage * rowsPerPage, summaries.length)

  return (
    <div suppressHydrationWarning className="flex flex-col gap-6 p-6">
      {/* HEADER SECTION (Title & Actions) */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Aktivitas
          </h1>
          <p className="text-sm text-muted-foreground">
            Lihat catatan penggunaan digitalmu dari waktu ke waktu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              className={`gap-2 rounded-xl px-5 text-sm font-medium transition-colors ${showFilterPopover || dateFrom || dateTo
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-border/60 text-slate-700 hover:bg-slate-50"
                }`}
              onClick={() => {
                if (!showFilterPopover) {
                  setDraftDateFrom(dateFrom)
                  setDraftDateTo(dateTo)
                }
                setShowFilterPopover(!showFilterPopover)
              }}
            >
              <IconFilter className="size-4" />
              Filter
            </Button>

            {showFilterPopover && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-fade-in-up overflow-hidden rounded-2xl border border-border/60 bg-white shadow-lg shadow-black/4">
                {/* Konten Filter Popover dibiarkan seperti asli */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-background">
                      <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Start Date</span>
                      <input type="date" value={draftDateFrom} onChange={(e) => setDraftDateFrom(e.target.value)} className="ml-auto min-w-0 bg-transparent text-sm outline-none [color-scheme:light dark:dark]" />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-background">
                      <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">End Date</span>
                      <input type="date" value={draftDateTo} onChange={(e) => setDraftDateTo(e.target.value)} className="ml-auto min-w-0 bg-transparent text-sm outline-none [color-scheme:light dark:dark]" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/40 px-5 py-3 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDraftDateFrom("")
                      setDraftDateTo("")
                      setDateFrom("")
                      setDateTo("")
                      setPage(1)
                      setShowFilterPopover(false)
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-blue-600 px-5 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
                    onClick={() => {
                      setDateFrom(draftDateFrom)
                      setDateTo(draftDateTo)
                      setPage(1)
                      setShowFilterPopover(false)
                    }}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* DESAIN BARU EKSPOR PDF MODAL */}
          <Popover open={exportOpen} onOpenChange={setExportOpen}>
            <PopoverTrigger asChild>
              <Button className="gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-all">
                <IconDownload className="size-4" />
                Ekspor PDF
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-90 rounded-2xl p-5" align="end">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <IconDownload className="size-4" stroke={2} />
                    <h3 className="font-semibold text-sm">Ekspor PDF</h3>
                  </div>
                  <button
                    onClick={() => setExportOpen(false)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <IconX className="size-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-slate-700">Pilih data yang akan diekspor</p>

                  {/* Opsi 1: Semua Data */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-blue-600">
                      {exportMode === "filtered" && <div className="size-2 rounded-full bg-blue-600" />}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={exportMode === "filtered"}
                      onChange={() => setExportMode("filtered")}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">Semua data</span>
                      <span className="text-xs text-slate-500 mt-0.5">Seluruh riwayat aktivitasmu dari awal hingga terkini</span>
                    </div>
                  </label>

                  {/* Opsi 2: Kustom Data */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${exportMode === "custom" ? "border-blue-600" : "border-slate-300"}`}>
                      {exportMode === "custom" && <div className="size-2 rounded-full bg-blue-600" />}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={exportMode === "custom"}
                      onChange={() => setExportMode("custom")}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">Data sesuai rentang kustom</span>
                      <span className="text-xs text-slate-500 mt-0.5">Pilih rentang tanggal sendiri</span>
                    </div>
                  </label>

                  {/* Input Tanggal Kustom (Muncul jika Opsi 2 Dipilih) */}
                  {exportMode === "custom" && (
                    <div className="flex flex-col gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-background">
                        <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Start Date</span>
                        <input
                          type="date"
                          value={exportDateFrom}
                          onChange={(e) => setExportDateFrom(e.target.value)}
                          className="ml-auto min-w-0 bg-transparent text-sm outline-none [color-scheme:light dark:dark]"
                        />
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 px-3.5 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-background">
                        <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">End Date</span>
                        <input
                          type="date"
                          value={exportDateTo}
                          onChange={(e) => setExportDateTo(e.target.value)}
                          className="ml-auto min-w-0 bg-transparent text-sm outline-none [color-scheme:light dark:dark]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {exportPreview && (
                  <p className="text-xs text-slate-500">
                    {exportPreview.count} entri akan diekspor ({exportPreview.from} – {exportPreview.to})
                  </p>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl hover:bg-slate-50"
                    onClick={() => setExportOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleExportPDF}
                  >
                    <IconDownload className="size-4" />
                    Ekspor PDF
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ACTIVE DATE FILTER BADGE */}
      {(dateFrom || dateTo) && (
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 shadow-sm">
            <IconCalendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-slate-700">
              {dateFrom ? formatShortDate(dateFrom) : "Awal"} - {dateTo ? formatShortDate(dateTo) : "Sekarang"}
            </span>
            <button
              onClick={() => {
                setDateFrom("")
                setDateTo("")
                setDraftDateFrom("")
                setDraftDateTo("")
                setPage(1)
              }}
              className="ml-2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <IconX className="size-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              setDateFrom("")
              setDateTo("")
              setDraftDateFrom("")
              setDraftDateTo("")
              setPage(1)
            }}
            className="text-sm font-medium text-blue-600 hover:underline transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* TABLE SECTION */}
      {summaries.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm ring-1 ring-black/5">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-50">
              <IconHistory className="size-8 text-blue-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800">Belum ada aktivitas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Mulai catat aktivitas digitalmu untuk melihat riwayat di sini.
            </p>
            <Button asChild className="mt-6 gap-2 bg-blue-600 rounded-xl hover:bg-blue-700">
              <Link href="/input-aktivitas">
                <IconPlus className="size-4" />
                Input Aktivitas
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-none shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {/* Header tabel dibiarkan sama */}
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Total Screen Time</th>
                  <th className="px-6 py-4 font-medium">Kategori Terbanyak</th>
                  <th className="px-6 py-4 font-medium">Catatan</th>
                  <th className="px-6 py-4 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedSummaries.map((summary) => (
                  <tr
                    key={summary.date}
                    className="border-b last:border-b-0 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        {formatShortDate(summary.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {formatTotalDuration(summary.totalMinutes)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${categoryBadgeStyles[summary.dominantCategory] ??
                          categoryBadgeStyles.lainnya
                          }`}
                      >
                        {categoryLabels[summary.dominantCategory] ?? "Lainnya"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-62.5 truncate">
                      {(() => {
                        const dayActivities = filteredActivities.filter(
                          (a) => a.date === summary.date && a.notes
                        )
                        if (dayActivities.length === 0) return "—"
                        return dayActivities.map((a) => a.notes).join("; ")
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedDay(summary)
                            setSelectedDayActivities(
                              activities.filter((a) => a.date === summary.date)
                            )
                            setEditingActivity(null)
                          }}
                          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800"
                        >
                          <IconEye className="size-4" stroke={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-slate-500">
              Menampilkan {startItem}–{endItem} dari {summaries.length} data
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Rows per page</span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(v) => {
                    setRowsPerPage(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-17.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROWS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={String(opt)}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-50"
                >
                  <IconChevronLeft className="size-4" />
                </button>

                {/* Logic Paginasi Angka */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Tampilkan maksimal ~5 halaman agar rapi (ellipses)
                  if (totalPages > 5) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - safePage) > 1) {
                      if (pageNum === safePage - 2 || pageNum === safePage + 2) {
                        return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${safePage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-50"
                >
                  <IconChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* DETAIL MODAL (Dibiarkan persis seperti aslinya) */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="w-full max-w-125 max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Detail {formatShortDate(selectedDay.date)}
              </h2>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setIsAdding(true)}
              >
                <IconPlus className="size-3.5" />
                Tambah
              </Button>
            </div>

            {isAdding && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryLabels).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAddCategory(id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${addCategory === id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={23}
                      className="w-16"
                      value={addHours}
                      onChange={(e) => setAddHours(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">jam</span>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={59}
                      className="w-16"
                      value={addMinutes}
                      onChange={(e) => setAddMinutes(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">menit</span>
                  </div>
                  <Textarea
                    placeholder="Catatan (opsional)"
                    rows={2}
                    className="resize-none"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAdding(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={!addCategory}
                      onClick={handleAddActivity}
                    >
                      <IconDeviceFloppy className="size-3.5" />
                      Simpan
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedDayActivities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Tidak ada aktivitas untuk hari ini.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {selectedDayActivities.map((activity) => {
                  const Icon = categoryIcons[activity.category] ?? IconDots
                  const isEditing = editingActivity?.id === activity.id

                  if (isEditing) {
                    return (
                      <div
                        key={activity.id}
                        className="rounded-lg border bg-muted/30 p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(categoryLabels).map(([id, label]) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setEditCategory(id)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${editCategory === id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="0"
                              min={0}
                              max={23}
                              className="w-16"
                              value={editHours}
                              onChange={(e) => setEditHours(e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">jam</span>
                            <Input
                              type="number"
                              placeholder="0"
                              min={0}
                              max={59}
                              className="w-16"
                              value={editMinutes}
                              onChange={(e) => setEditMinutes(e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">menit</span>
                          </div>
                          <Textarea
                            placeholder="Catatan (opsional)"
                            rows={2}
                            className="resize-none"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingActivity(null)}
                            >
                              Batal
                            </Button>
                            <Button size="sm" className="gap-1.5" onClick={handleSaveEdit}>
                              <IconDeviceFloppy className="size-3.5" />
                              Simpan
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium">
                            {categoryLabels[activity.category] ?? "Lainnya"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTotalDuration(
                              activity.durationHours * 60 + activity.durationMinutes
                            )}
                          </span>
                          {activity.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(activity)}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <IconPencil className="size-3.5" />

                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                              <IconTrash className="size-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Menghapus aktivitas ini dapat mereset atau memutus Streak kamu.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedDay(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}