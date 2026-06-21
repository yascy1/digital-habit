import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Digital Habit
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Bangun Kebiasaan Positifmu Mulai Hari Ini
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Pantau dan kelola waktu layarmu. Bentuk kebiasaan digital yang lebih
          sehat, satu langkah kecil setiap hari.
        </p>
        <Button asChild size="lg" className="mt-8 px-8">
          <Link href="/register">Mulai Sekarang</Link>
        </Button>
      </main>
    </div>
  )
}
