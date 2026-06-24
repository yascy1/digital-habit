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

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginForm) {
    localStorage.setItem("digital-habit-user", JSON.stringify({ email: data.email }))
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
                placeholder="Masukkan password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="mt-2 w-full">
              Masuk
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-foreground hover:underline">
                Daftar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}