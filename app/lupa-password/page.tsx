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

type Step = "email" | "verify" | "reset" | "done"

const emailSchema = z.object({
  email: z.email("Email tidak valid"),
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Digital Habit
        </Link>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent>
          {step === "done" ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Password Berhasil Diubah</h2>
              <p className="text-center text-sm text-muted-foreground">
                Silakan masuk dengan password baru Anda.
              </p>
              <Button asChild className="mt-2 w-full">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          ) : step === "email" ? (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Lupa Password</h2>
                <p className="text-sm text-muted-foreground">
                  Masukkan email akun Anda untuk mereset password.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  aria-invalid={!!emailForm.formState.errors.email || !!error}
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>

              <Button type="submit" className="mt-2 w-full">
                Lanjutkan
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-foreground hover:underline">
                  Kembali ke Masuk
                </Link>
              </p>
            </form>
          ) : step === "verify" ? (
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Verifikasi Identitas</h2>
                <p className="text-sm text-muted-foreground">
                  Masukkan nama lengkap Anda untuk verifikasi.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap sesuai akun"
                  aria-invalid={!!verifyForm.formState.errors.name || !!error}
                  {...verifyForm.register("name")}
                />
                {verifyForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{verifyForm.formState.errors.name.message}</p>
                )}
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>

              <Button type="submit" className="mt-2 w-full">
                Verifikasi
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError("") }}
                  className="font-medium text-foreground hover:underline"
                >
                  Kembali
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Masukkan password baru Anda.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  aria-invalid={!!resetForm.formState.errors.password}
                  {...resetForm.register("password")}
                />
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  aria-invalid={!!resetForm.formState.errors.confirmPassword}
                  {...resetForm.register("confirmPassword")}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="mt-2 w-full">
                Simpan Password Baru
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => { setStep("verify"); setError("") }}
                  className="font-medium text-foreground hover:underline"
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
