"use client"

import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const registerSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterForm) {
    const users = JSON.parse(localStorage.getItem("digital-habit-users") ?? "[]")
    users.push({ name: data.name, email: data.email })
    localStorage.setItem("digital-habit-users", JSON.stringify(users))
    localStorage.setItem("digital-habit-user", JSON.stringify({ email: data.email, name: data.name }))
    router.push("/dashboard")
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
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nama lengkap"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="mt-2 w-full">
              Daftar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}