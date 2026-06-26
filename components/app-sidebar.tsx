"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconPlus,
  IconHistory,
  IconUser,
  IconLogout,
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
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-1 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              Digital Habit
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Kelola kebiasaan digitalmu
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-6">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
          <IconLogout className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
