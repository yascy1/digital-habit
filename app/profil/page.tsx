"use client"

import { useState, useEffect, useRef } from "react"
import {
  IconUser,
  IconCalendar,
  IconMail,
  IconClock,
  IconHeart,
  IconEdit,
  IconX,
  IconDeviceFloppy,
  IconCamera,
  IconTrash,
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getProfile, saveProfile, getActivities } from "@/lib/activities"
import type { UserProfile, Activity } from "@/lib/types"

const MAX_AVATAR_SIZE = 500 * 1024

const bannerPresets = [
  { id: "blue", gradient: "from-primary/20 via-primary/10 to-primary/5", swatch: "bg-gradient-to-r from-blue-400 to-blue-200" },
  { id: "green", gradient: "from-green-400/20 via-emerald-400/10 to-teal-50/5", swatch: "bg-gradient-to-r from-green-400 to-emerald-200" },
  { id: "purple", gradient: "from-purple-400/20 via-violet-400/10 to-indigo-50/5", swatch: "bg-gradient-to-r from-purple-400 to-violet-200" },
  { id: "sunset", gradient: "from-orange-400/20 via-rose-400/10 to-pink-50/5", swatch: "bg-gradient-to-r from-orange-400 to-rose-200" },
  { id: "ocean", gradient: "from-cyan-400/20 via-blue-400/10 to-sky-50/5", swatch: "bg-gradient-to-r from-cyan-400 to-blue-200" },
  { id: "none", gradient: "bg-muted", swatch: "bg-muted border border-border" },
]

const categoryLabels: Record<string, string> = {
  "media-sosial": "Media Sosial",
  "belajar-kerja": "Belajar/Kerja",
  hiburan: "Hiburan",
  gaming: "Gaming",
  lainnya: "Lainnya",
}

function computeStats(activities: Activity[]) {
  const totalActivities = activities.length
  const totalMinutes = activities.reduce(
    (sum, a) => sum + a.durationHours * 60 + a.durationMinutes,
    0
  )

  const uniqueDays = new Set(activities.map((a) => a.date)).size
  const avgMinutes = totalActivities > 0 ? Math.round(totalMinutes / Math.max(1, uniqueDays)) : 0
  const avgHours = Math.floor(avgMinutes / 60)
  const avgMins = avgMinutes % 60

  const categoryCount: Record<string, number> = {}
  activities.forEach((a) => {
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1
  })
  const topCategory = Object.entries(categoryCount).sort(
    (a, b) => b[1] - a[1]
  )[0]

  return {
    totalActivities,
    avgScreenTime: `${avgHours} jam ${avgMins} menit / hari`,
    topCategory: topCategory ? categoryLabels[topCategory[0]] ?? topCategory[0] : "-",
  }
}

function getBannerGradient(id: string): string {
  return bannerPresets.find((b) => b.id === id)?.gradient ?? bannerPresets[0].gradient
}

const defaultProfile: UserProfile = {
  name: "",
  fullName: "",
  email: "",
  joinDate: "12 Juni 2026",
  avatarUrl: "",
  bannerId: "blue",
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [activities, setActivities] = useState<Activity[]>([])
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(defaultProfile.fullName)
  const [editEmail, setEditEmail] = useState(defaultProfile.email)
  const [editAvatar, setEditAvatar] = useState(defaultProfile.avatarUrl)
  const [editBanner, setEditBanner] = useState(defaultProfile.bannerId)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProfile(getProfile())
    setActivities(getActivities())
  }, [])

  const stats = computeStats(activities)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_AVATAR_SIZE) {
      alert("Ukuran gambar terlalu besar. Maksimal 500KB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setEditAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setEditAvatar("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      fullName: editName,
      email: editEmail,
      name: editName.split(" ")[0],
      avatarUrl: editAvatar,
      bannerId: editBanner,
    }
    saveProfile(updated)
    setProfile(updated)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div suppressHydrationWarning className="flex flex-col gap-6 p-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className={`h-28 bg-gradient-to-r ${getBannerGradient(profile.bannerId)}`} />
        <CardContent className="relative -mt-14 flex items-end justify-between pb-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background shadow-md">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 pb-1">
              <h1 className="text-xl font-bold tracking-tight">{profile.fullName}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconCalendar className="size-3.5" />
                  Joined since {profile.joinDate}
                </span>
              </div>
            </div>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditName(profile.fullName)
                setEditEmail(profile.email)
                setEditAvatar(profile.avatarUrl)
                setEditBanner(profile.bannerId)
                setEditing(true)
              }}
            >
              <IconEdit className="size-4" />
              Edit Profil
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form (conditional) */}
      {editing && (
        <Card className="animate-fade-in-up">
          <CardContent>
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-lg font-semibold">Edit Profil</h2>

              {/* Banner Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Banner</label>
                <div className="flex flex-wrap gap-2">
                  {bannerPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditBanner(preset.id)}
                      className={`size-10 rounded-lg transition-all ${preset.swatch} ${
                        editBanner === preset.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:ring-2 hover:ring-border hover:ring-offset-1"
                      }`}
                      title={preset.id === "none" ? "Tanpa banner" : preset.id}
                    />
                  ))}
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl bg-muted">
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <IconCamera className="size-5 text-white" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Foto Profil</span>
                  <span className="text-xs text-muted-foreground">Klik untuk mengubah. Maks 500KB.</span>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IconCamera className="size-3" />
                      Ubah
                    </Button>
                    {editAvatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                        onClick={handleRemoveAvatar}
                      >
                        <IconTrash className="size-3" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editEmail}
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">Email tidak dapat diubah karena digunakan sebagai identitas akun.</span>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                {saved && (
                  <span className="text-sm text-green-600">Tersimpan!</span>
                )}
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-1">
                  <IconX className="size-3.5" />
                  Batal
                </Button>
                <Button size="sm" className="gap-2" onClick={handleSave}>
                  <IconDeviceFloppy className="size-4" />
                  Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Informasi Akun */}
        <Card>
          <CardContent className="flex flex-col gap-5 py-6">
            <h2 className="font-heading text-lg font-semibold">Informasi Akun</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <IconUser className="size-4.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Nama Lengkap</span>
                  <span className="text-sm font-medium">{profile.fullName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <IconMail className="size-4.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <IconCalendar className="size-4.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Tanggal Bergabung</span>
                  <span className="text-sm font-medium">{profile.joinDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tentang */}
        <Card>
          <CardContent className="flex flex-col gap-5 py-6">
            <h2 className="font-heading text-lg font-semibold">Tentang</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Digital Habit membantu pengguna memahami pola penggunaan digital harian
              agar dapat membangun kebiasaan digital yang lebih sehat dan seimbang.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan */}
      <Card>
        <CardContent className="py-6">
          <h2 className="mb-5 font-heading text-lg font-semibold">Ringkasan</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <IconDeviceFloppy className="size-5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total Aktivitas</span>
                <span className="text-xl font-bold">{stats.totalActivities}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-green-50">
                <IconClock className="size-5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Rata-rata Screen Time</span>
                <span className="text-xl font-bold">{stats.avgScreenTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50">
                <IconHeart className="size-5 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Kategori Favorit</span>
                <span className="text-xl font-bold">{stats.topCategory}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
