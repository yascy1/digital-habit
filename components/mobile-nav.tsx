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

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    label: "Input",
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

export function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    localStorage.removeItem("digital-habit-user")
    router.push("/")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 md:hidden">
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold transition-all",
              isActive
                ? "text-blue-600"
                : "text-slate-400 active:text-slate-600"
            )}
          >
            <item.icon
              className={cn("size-5", isActive ? "text-blue-600" : "text-slate-400")}
              stroke={isActive ? 2.5 : 2}
            />
            {item.label}
          </Link>
        )
      })}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-400 transition-all active:text-red-500"
          >
            <IconLogout className="size-5" stroke={2} />
            Keluar
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Yakin ingin logout?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              Anda akan keluar dari akun ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
