"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react"

type Step = "email" | "verify" | "reset" | "done"

const emailSchema = z.object({
  email: z.string().email("Email tidak valid"), // Diperbaiki agar seragam z.string().email()
})

const verifySchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
})

const resetSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type EmailForm = z.infer<typeof emailSchema>
type VerifyForm = z.infer<typeof verifySchema>
type ResetForm = z.infer<typeof resetSchema>

export default function LupaPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [foundEmail, setFoundEmail] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  function onEmailSubmit(data: EmailForm) {
    setError("")
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")
    const user = users.find((u: { email: string }) => u.email === data.email)
    if (!user) {
      setError("Email tidak ditemukan")
      return
    }
    setFoundEmail(data.email)
    setStep("verify")
  }

  function onVerifySubmit(data: VerifyForm) {
    setError("")
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")
    const user = users.find(
      (u: { email: string; name: string }) =>
        u.email === foundEmail && u.name.toLowerCase() === data.name.toLowerCase()
    )
    if (!user) {
      setError("Nama tidak cocok dengan email ini")
      return
    }
    setStep("reset")
  }

  function onResetSubmit(data: ResetForm) {
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")
    const updated = users.map((u: { email: string; name: string; password?: string }) =>
      u.email === foundEmail ? { ...u, password: data.password } : u
    )
    localStorage.setItem("digital-habit-users", JSON.stringify(updated))
    setStep("done")
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
              <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-blue-200 animate-pulse" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
              Digital Habit
            </h1>
          </div>

          {/* RENDERING BERDASARKAN STEP */}
          {step === "done" ? (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 shadow-inner">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-slate-800">Password Berhasil Diubah</h2>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  Silakan masuk kembali menggunakan password baru Anda.
                </p>
              </div>
              <Button asChild className="mt-2 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10">
                <Link href="/login">
                  Masuk Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : step === "email" ? (
            <form key={step} onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-slate-800">Lupa Password</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan email akun Anda untuk proses pemulihan.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 px-1">Email</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email aktif Anda"
                    className="pl-10 pr-4 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                    aria-invalid={!!emailForm.formState.errors.email || !!error}
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{emailForm.formState.errors.email.message}</p>
                )}
                {error && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{error}</p>
                )}
              </div>

              <Button type="submit" className="mt-1 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform duration-200 hover:-translate-y-0.5">
                Lanjutkan <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-slate-500 mt-1">
                <Link href="/login" className="font-bold text-blue-600 hover:underline">
                  Kembali ke Masuk
                </Link>
              </p>
            </form>
          ) : step === "verify" ? (
            <form key={step} onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="flex flex-col gap-4">
              {/* JEBAKAN AUTOFILL CHROME */}
              <div className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <input type="email" name="fake_email_trap" tabIndex={-1} />
                <input type="password" name="fake_password_trap" tabIndex={-1} />
              </div>

              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-slate-800">Verifikasi Identitas</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan nama sesuai dengan akun Anda untuk verifikasi.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700 px-1">Nama Lengkap</Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama terdaftar"
                    autoComplete="new-password"
                    className="pl-10 pr-4 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                    aria-invalid={!!verifyForm.formState.errors.name || !!error}
                    {...verifyForm.register("name")}
                  />
                </div>
                {verifyForm.formState.errors.name && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{verifyForm.formState.errors.name.message}</p>
                )}
                {error && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{error}</p>
                )}
              </div>

              <Button type="submit" className="mt-1 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform duration-200 hover:-translate-y-0.5">
                Verifikasi <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-slate-500 mt-1">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError("") }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Kembali
                </button>
              </p>
            </form>
          ) : (
            <form key={step} onSubmit={resetForm.handleSubmit(onResetSubmit)} className="flex flex-col gap-4">
              {/* JEBAKAN AUTOFILL CHROME */}
              <div className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <input type="email" name="fake_email_trap_2" tabIndex={-1} />
                <input type="password" name="fake_password_trap_2" tabIndex={-1} />
              </div>

              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-slate-800">Reset Password</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan password baru yang aman untuk akun Anda.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 px-1">Password Baru</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="pl-10 pr-10 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                    aria-invalid={!!resetForm.formState.errors.password}
                    {...resetForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 px-1">Konfirmasi Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Konfirmasi password baru"
                    className="pl-10 pr-10 py-2 h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
                    aria-invalid={!!resetForm.formState.errors.confirmPassword}
                    {...resetForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500 px-1 mt-0.5">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="mt-1 w-full bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg h-9 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform duration-200 hover:-translate-y-0.5">
                Simpan Password Baru <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-slate-500 mt-1">
                <button
                  type="button"
                  onClick={() => { setStep("verify"); setError("") }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Kembali
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}