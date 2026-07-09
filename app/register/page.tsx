"use client"

import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { saveProfile } from "@/lib/activities"
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
} from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"), // Diperbaiki: z.string().email()
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterForm) {
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")

    const exists = users.some((u: any) => u.email === data.email)
    if (exists) {
      toast.error("Email sudah terdaftar. Silakan gunakan email lain atau masuk.")
      return
    }

    users.push({ name: data.name, email: data.email, password: data.password })
    localStorage.setItem("digital-habit-users", JSON.stringify(users))
    localStorage.setItem("digital-habit-user", JSON.stringify({ email: data.email, name: data.name }))
    saveProfile({ 
      name: data.name.split(" ")[0], 
      fullName: data.name, 
      email: data.email, 
      joinDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), 
      avatarUrl: "", 
      bannerId: "blue" 
    })
    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F4F7FC] px-4 font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* BACKGROUND DEKORATIF */}
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-indigo-200/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-blue-100/30 to-transparent pointer-events-none" />

      {/* CARD KONTEN (Dikecilkan ukurannya) */}
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

          {/* FORM PENDAFTARAN */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            {/* Input Nama */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700 px-1">Nama</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama"
                  className="pl-10 pr-4 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 px-1 mt-0.5">{errors.name.message}</p>
              )}
            </div>

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
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 px-1">Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
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

            {/* Input Konfirmasi Password */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 px-1">Konfirmasi Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password"
                  className="pl-10 pr-10 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 px-1 mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Button Submit (Lebih kompak) */}
            <Button 
              type="submit" 
              className="mt-1 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Daftar Akun <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Navigasi Ke Halaman Login */}
            <p className="text-center text-xs text-slate-500 mt-1">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}