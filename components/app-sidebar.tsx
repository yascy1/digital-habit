"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconPlus,
  IconHistory,
  IconUser,
  IconLogout
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    label: "Input Aktivitas",
    href: "/input-aktivitas",
    icon: IconPlus,
  },
  {
    label: "Riwayat",
    href: "/riwayat",
    icon: IconHistory,
  },
  {
    label: "Profil",
    href: "/profil",
    icon: IconUser,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    localStorage.removeItem("digital-habit-user")
    router.push("/")
  }

  return (
    // Tambahkan relative dan overflow-hidden di sini
    <aside className="relative flex h-full w-64 flex-col border-r border-slate-200 bg-white overflow-hidden">
      
      {/* ================= GAMBAR DAUN SIDEBAR ================= */}
      {/* Letakkan absolute di bawah, z-0 agar jadi background */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0 opacity-80">
        <img 
          src="/digital-habit/bg-daun.png" // Ganti dengan path file gambar daun vektor kamu
          alt="Dekorasi Daun" 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* HEADER LOGO */}
      {/* Tambahkan relative z-10 agar selalu berada di atas gambar daun */}
      <div className="relative z-10 p-6 mb-4">
        <div className="flex items-center gap-3">
          <img src="/digital-habit/logo.png" alt="Digital Habit Logo" className="size-10 rounded-xl shadow-md object-cover" />
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Digital Habit
            </h1>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              Kelola kebiasaan digitalmu
            </p>
          </div>
        </div>
      </div>

      {/* MENU NAVIGATION */}
      {/* Tambahkan relative z-10 di sini juga */}
      <nav className="relative z-10 flex flex-1 flex-col gap-1.5 px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-none"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className={cn("size-5", isActive ? "text-blue-600" : "text-slate-400")} stroke={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* LOGOUT BUTTON */}
      {/* Tambahkan relative z-10 di sini agar tetap bisa diklik */}
      <div className="relative z-10 px-4 pb-6 mt-auto">
        <button 
          onClick={handleLogout} 
          // Ubah background hover jadi putih semi transparan/krem agar tidak bentrok dengan warna daun jika perlu,
          // tapi memakai red-50 seperti kodemu juga sudah oke selama teksnya terbaca.
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 bg-white/50 backdrop-blur-sm"
        >
          <IconLogout className="size-5" stroke={2} />
          Logout
        </button>
      </div>
    </aside>
  )
}