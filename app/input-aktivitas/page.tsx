"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconSocial,
  IconBook,
  IconDeviceGamepad2,
  IconDots,
  IconSchool,
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const categories = [
  { id: "media-sosial", label: "Media Sosial", icon: IconSocial },
  { id: "belajar-kerja", label: "Belajar/Kerja", icon: IconBook },
  { id: "hiburan", label: "Hiburan", icon: IconSchool },
  { id: "gaming", label: "Gaming", icon: IconDeviceGamepad2 },
  { id: "lainnya", label: "Lainnya", icon: IconDots },
]

export default function InputAktivitasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")

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
          Catat aktivitas digitalmu hari ini.
        </p>
      </div>

      <Card>
        <CardContent>
          <form className="flex flex-col gap-6">
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
                  <Input type="number" placeholder="0" min={0} max={23} className="w-20" />
                  <span className="text-sm text-muted-foreground">jam</span>
                  <Input type="number" placeholder="0" min={0} max={59} className="w-20" />
                  <span className="text-sm text-muted-foreground">menit</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Input type="date" defaultValue="2026-06-17" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Waktu Mulai</label>
                <Input type="time" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Waktu Selesai</label>
                <Input type="time" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Catatan <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <Textarea
                placeholder="Tambahkan catatan tentang aktivitas ini..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <IconDeviceFloppy className="size-4" />
                Simpan Aktivitas
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
