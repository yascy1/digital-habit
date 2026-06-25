"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const authorized = useMemo(() => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("digital-habit-user")
  }, [])

  useEffect(() => {
    if (!authorized) {
      router.replace("/login")
    }
  }, [authorized, router])

  if (!authorized) return null
  return <>{children}</>
}