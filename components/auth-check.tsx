"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // 1. Buat state penanda apakah user sudah terverifikasi dan komponen siap
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 2. Kode di dalam useEffect ini HANYA jalan di browser
    const user = localStorage.getItem("digital-habit-user")
    
    if (!user) {
      router.replace("/login") // Lempar ke login kalau kosong
    } else {
      setIsReady(true) // Izinkan masuk kalau ada
    }
  }, [router])

  // 3. Pada render pertama, Server dan Browser SAMA-SAMA merender null
  // Tidak akan ada Hydration Mismatch!
  if (!isReady) return null

  // 4. Setelah pengecekan di useEffect selesai dan isReady = true, tampilkan isinya
  return <>{children}</>
}