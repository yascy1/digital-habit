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
import { toast } from "sonner"


// BAGIAN 1: KONFIGURASI & VARIABEL STATIS

const MAX_AVATAR_SIZE = 1024 * 1024

const bannerPresets = [
  { id: "blue", imageSrc: "banner-blue.png", label: "banner-blue" },
  { id: "green", imageSrc: "banner-green.png", label: "banner-green" },
  { id: "purple", imageSrc: "banner-purple.png", label: "banner-purple" },
  { id: "orange", imageSrc: "banner-orange.png", label: "banner-orange" },
  { id: "pink", imageSrc: "banner-pink.png", label: "banner-pink" },
  { id: "choco", imageSrc: "banner-choco.png", label: "banner-choco" },
]

const categoryLabels: Record<string, string> = {
  "media-sosial": "Media Sosial",
  "belajar-kerja": "Belajar / Kerja",
  hiburan: "Hiburan",
  gaming: "Gaming",
  lainnya: "Lainnya",
}


// BAGIAN 2: FUNGSI PEMBANTU (HELPER FUNCTIONS)

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

function getBannerImage(id: string): string {
  return bannerPresets.find((b) => b.id === id)?.imageSrc ?? bannerPresets[0].imageSrc
}

const defaultProfile: UserProfile = {
  name: "",
  fullName: "",
  email: "",
  joinDate: "3 Juli 2026",
  avatarUrl: "",
  bannerId: "blue",
}


// BAGIAN 3: KOMPONEN UTAMA

export default function ProfilPage() {
  // --- STATE (Penyimpanan Data di Komponen) ---
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [activities, setActivities] = useState<Activity[]>([])
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(defaultProfile.fullName)
  const [editEmail, setEditEmail] = useState(defaultProfile.email)
  const [editAvatar, setEditAvatar] = useState(defaultProfile.avatarUrl)
  const [editBanner, setEditBanner] = useState(defaultProfile.bannerId)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- EFEK (Dijalankan saat halaman pertama kali dimuat) ---
  useEffect(() => {
    setProfile(getProfile())
    setActivities(getActivities())
  }, [])

  const stats = computeStats(activities)

  // --- FUNGSI AKSI (HANDLERS) ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Ukuran gambar terlalu besar. Maksimal 1MB.")
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
    ? profile.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "D"


  // BAGIAN 4: RENDER ANTARMUKA (UI)
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full bg-[#F8FAFC]">

      {/* HEADER KARTU PROFIL */}
      <Card className="overflow-hidden border-none rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] relative bg-white min-h-60 flex items-center">

        {/* Banner */}
        <div className="absolute inset-0 z-0">
          <img
            src={getBannerImage(profile.bannerId)}
            alt="Profile Banner"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Konten Data Profil (Avatar & Info, posisinya di atas gambar banner) */}
        <CardContent className="relative z-10 flex items-center gap-6 p-8 w-full">
          <div className="relative shrink-0">
            {/* Foto Profil */}
            <div className="flex size-26 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF2F6] shadow-sm relative z-10">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="size-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-blue-600 font-sans">{initials}</span>
              )}
            </div>
            {/* Tombol Pensil (Edit Profil) - Hanya muncul jika tidak sedang mengedit */}
            {!editing && (
              <button
                onClick={() => {
                  setEditName(profile.fullName)
                  setEditEmail(profile.email)
                  setEditAvatar(profile.avatarUrl)
                  setEditBanner(profile.bannerId)
                  setEditing(true)
                }}
                className="absolute bottom-1 right-0 bg-white border border-slate-200 shadow-sm p-2 rounded-full text-indigo-500 hover:text-indigo-600 hover:scale-105 transition-all z-20"
              >
                <IconEdit className="size-4" />
              </button>
            )}
          </div>
          {/* Teks Nama & Tanggal Bergabung */}
          <div className="flex flex-col gap-1.5 mx-10 my-16 z-10">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dropdown-shadow-md">{profile.fullName || "Demo"}</h1>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
              <IconCalendar className="size-4 text-slate-700" />
              <span>Bergabung sejak {profile.joinDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FORM EDIT PROFIL */}
      {editing && (
        <Card className="border-none rounded-3xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.04)] bg-white overflow-hidden transition-all duration-300">
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <IconUser className="size-5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Edit Profil</h2>
            </div>

            {/* Pilihan Foto Banner */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Tema Foto</label>
              <div className="flex flex-wrap gap-3">
                {bannerPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setEditBanner(preset.id)}
                    className={`size-16 rounded-xl overflow-hidden transition-all relative border border-slate-200 ${editBanner === preset.id
                      ? "ring-2 ring-blue-600 ring-offset-2 scale-95 shadow-md"
                      : "hover:scale-105"
                      }`}
                    title={preset.label}
                  >
                    <img src={preset.imageSrc} alt={preset.label} className="w-full h-full object-cover" />
                    {editBanner === preset.id && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pengaturan Foto Profil (Ubah, Hapus, Preview) */}
            <div className="flex items-center gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-[#EEF2F6] border border-slate-200 shrink-0">
                {editAvatar ? (
                  <img src={editAvatar} alt="Preview" className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-extrabold text-slate-400">{initials}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-800">Foto Profil</span>
                <span className="text-[11px] text-slate-400 leading-tight">JPG, PNG atau WEBP. Maks. 1MB.</span>
                <div className="flex gap-2 mt-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-4 font-semibold shadow-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconCamera className="size-3.5 mr-1.5" />
                    Ubah Foto
                  </Button>
                  {editAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs px-3 font-semibold"
                      onClick={handleRemoveAvatar}
                    >
                      <IconTrash className="size-3.5 mr-1" />
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

            {/* Input Data Diri */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-blue-500 h-10 px-4"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  disabled
                  className="rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-400 h-10 px-4 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bar Aksi Simpan / Batal */}
            <div className="flex items-center gap-3 justify-end border-t border-slate-100 pt-5 mt-2">
              {saved && <span className="text-xs font-semibold text-emerald-600">Perubahan tersimpan!</span>}
              <Button
                variant="outline"
                className="rounded-full h-9 px-5 border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                onClick={() => setEditing(false)}
              >
                <IconX className="size-3.5 mr-1" />
                Batal
              </Button>
              <Button
                className="rounded-full h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10"
                onClick={handleSave}
              >
                <IconDeviceFloppy className="size-3.5 mr-1.5" />
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GRID DATA UTAMA */}
      {/* Terdiri dari 2 Kolom (Informasi Akun dan Tentang Digital Habit) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* KARTU 1: Informasi Detail Akun (Nama, Email, Tgl Join) */}
        <Card className="border-none rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.01)] bg-white p-6">
          <CardContent className="flex flex-col gap-5 p-0 py-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <IconUser className="size-4.5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Informasi Akun</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-50/40 p-3 rounded-xl border border-slate-100/50">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-blue-600">
                  <IconUser className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Nama Lengkap</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5">{profile.fullName || "Demo"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/40 p-3 rounded-xl border border-slate-100/50">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-blue-600">
                  <IconMail className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5">{profile.email || "demotesting@email.com"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/40 p-3 rounded-xl border border-slate-100/50">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-blue-600">
                  <IconCalendar className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tanggal Bergabung</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5">{profile.joinDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KARTU 2: Tentang Digital Habit */}
        <Card className="border-none rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.01)] bg-white p-6 relative overflow-hidden">

          <CardContent className="flex flex-col gap-4 p-0 py-2 h-full justify-start relative z-10 w-[70%]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <IconHeart className="size-4.5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Tentang Digital Habit</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-medium">
              Digital Habit membantu pengguna memahami pola penggunaan digital harian agar dapat membangun kebiasaan digital yang lebih sehat dan seimbang.
            </p>
          </CardContent>

          {/* Gambar Pot diletakkan absolute di pojok kanan bawah */}
          <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none z-0">
            {/* Gunakan object-contain agar gambar 3D tidak terpotong, dan hapus mix-blend-multiply */}
            <img
              src="pot.png"
              alt="Ilustrasi Pot"
              className="w-full h-full object-bottom-right drop-shadow-md"
            />
          </div>
        </Card>
      </div>


      {/* RINGKASAN AKTIVITAS */}
      <Card className="border-none rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.01)] bg-white p-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <IconClock className="size-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Ringkasan</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            {/* Box 1: Total Aktivitas */}
            <div className="flex items-center gap-4 border border-slate-100 bg-slate-50/30 p-5 rounded-2xl shadow-2xs">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100/50 shrink-0 text-blue-600">
                <IconDeviceFloppy className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Aktivitas</span>
                <span className="text-xl font-black text-slate-800 mt-0.5">{stats.totalActivities}</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Aktivitas tercatat</span>
              </div>
            </div>

            {/* Box 2: Rata-Rata Screen Time */}
            <div className="flex items-center gap-4 border border-slate-100 bg-slate-50/30 p-5 rounded-2xl shadow-2xs">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100/50 shrink-0 text-emerald-600">
                <IconClock className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Screen Time</span>
                <span className="text-lg font-black text-slate-800 mt-0.5 leading-tight">{stats.avgScreenTime}</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Waktu rata-rata harian</span>
              </div>
            </div>

            {/* Box 3: Kategori Favorit */}
            <div className="flex items-center gap-4 border border-slate-100 bg-slate-50/30 p-5 rounded-2xl shadow-2xs">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100/50 shrink-0 text-purple-600">
                <IconHeart className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Favorit</span>
                <span className="text-lg font-black text-slate-800 mt-0.5 leading-tight">{stats.topCategory}</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Paling sering digunakan</span>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>
    </div>
  )
}