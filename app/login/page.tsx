"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
} from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"), // Diperbaiki agar seragam z.string().email()
  password: z.string().min(8, "Password minimal 8 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginForm) {
    setLoginError("")
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")
    const found = users.find((u: { email: string; password: string }) => u.email === data.email)
    if (!found) {
      setLoginError("Email belum terdaftar. Silakan daftar terlebih dahulu.")
      return
    }
    if (found.password !== data.password) {
      setLoginError("Email atau password salah.")
      return
    }
    localStorage.setItem("digital-habit-user", JSON.stringify({ email: data.email, name: found.name }))
    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F4F7FC] px-4 font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* BACKGROUND DEKORATIF */}
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-indigo-200/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-blue-100/30 to-transparent pointer-events-none" />

      {/* CARD KONTEN COMPACT */}
      <Card className="w-full max-w-95 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] p-6 relative z-10">
        <CardContent className="p-0">
          
          {/* LOGO & BRAND */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative mb-2">
              <img src="/digital-habit/logo.png" alt="Digital Habit Logo" className="h-9 w-9 rounded-lg shadow-md shadow-blue-500/25 object-cover" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
              Digital Habit
            </h1>
          </div>

          {/* FORM LOGIN */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            {/* Input Email */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 px-1">Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email aktif"
                  className="pl-10 pr-4 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 px-1 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Input Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                <Link href="/lupa-password" className="text-[11px] font-medium text-slate-400 hover:text-blue-600 hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  className="pl-10 pr-10 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 px-1 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Pesan Error Login Global */}
            {loginError && (
              <p className="text-xs text-red-500 text-center bg-red-50 py-2 px-3 rounded-lg border border-red-100 font-medium">
                {loginError}
              </p>
            )}

            {/* Button Submit */}
            <Button 
              type="submit" 
              className="mt-1 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Masuk <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Navigasi Ke Halaman Daftar */}
            <p className="text-center text-xs text-slate-500 mt-1">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Daftar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}