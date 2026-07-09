"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  BarChart2,
  Target,
  Heart,
  Sparkles,
  FileText,
  Calendar,
  User,
} from "lucide-react"

// Variabel Animasi (Framer Motion)
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

// Data Fitur Multi-Screen untuk Interactive Tabs
const highlightFeatures = [
  {
    id: "dashboard",
    icon: BarChart2,
    title: "Dashboard Interaktif",
    description: "Pantau waktu layar, lihat persentase kebiasaanmu, dan pertahankan streak harian dalam satu layar penuh yang memanjakan mata.",
    screens: [
      { label: "Harian", image: "/digital-habit/dash-harian.png" },
      { label: "Mingguan", image: "/digital-habit/dash-mingguan.png" },
      { label: "Bulanan", image: "/digital-habit/dash-bulanan.png" },
    ]
  },
  {
    id: "input",
    icon: FileText,
    title: "Input Sangat Cepat",
    description: "Tidak perlu ribet. Pilih kategori, masukkan durasi kegiatan, dan simpan.",
    screens: [
      { label: "Form Input", image: "/digital-habit/input-form.png" },
    ]
  },
  {
    id: "history",
    icon: Calendar,
    title: "Riwayat & Laporan",
    description: "Evaluasi produktivitasmu dengan melihat histori lengkap. Unduh laporan aktivitasmu dalam bentuk PDF dengan satu klik.",
    screens: [
      { label: "Tabel Riwayat", image: "/digital-habit/history-table.png" },
      { label: "Detail Harian", image: "/digital-habit/history-detail.png" },
      { label: "Ekspor PDF", image: "/digital-habit/history-pdf.png" },
    ]
  }
]

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(highlightFeatures[0].id)
  const [activeScreenIndex, setActiveScreenIndex] = useState(0)

  // Reset screen index ke 0 setiap kali ganti fitur utama
  useEffect(() => {
    setActiveScreenIndex(0)
  }, [activeFeature])

  const currentFeature = highlightFeatures.find(f => f.id === activeFeature)
  const currentImage = currentFeature?.screens[activeScreenIndex]?.image

  return (
    <div className="relative min-h-screen bg-[#F4F7FC] text-[#1E293B] overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">

      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-linear-to-br from-blue-400 to-indigo-300 opacity-20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-125 h-125 bg-purple-300 opacity-15 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER / NAVBAR */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-[#F4F7FC]/80 backdrop-blur-md border-b border-slate-200/50"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-2">
            <img src="/digital-habit/logo.png" alt="Digital Habit Logo" className="h-10 w-10 rounded-xl shadow-md object-cover" />
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              Digital Habit
            </span>
          </div>

          <div className="flex items-center gap-4">

            <Button asChild variant="ghost" className="hidden sm:inline-flex text-slate-700 font-medium border border-slate-300 rounded-full px-6 hover:bg-slate-200/50">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-full px-6 shadow-md shadow-blue-600/10 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <Link href="/register">
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <main className="mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Content Left */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col items-start text-left relative"
          >
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1] mb-6 font-serif">
              Bangun Kebiasaan Positifmu <br />
              <span className="relative inline-block bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent italic font-sans py-1">
                Mulai Hari Ini.
                <Sparkles className="absolute -right-8 top-2 h-5 w-5 text-blue-400/70 hidden sm:block animate-pulse" />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 mb-4">
              Aplikasi pelacak screen time untuk kebiasaan digital yang lebih sehat.
            </motion.p>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
              Pantau, kelola, dan pahami waktu layarmu dengan <span className="text-blue-600 font-semibold">insight</span> yang bermakna untuk membentuk kebiasaan digital yang lebih <span className="text-[#0F172A] font-bold">sehat, fokus, dan produktif.</span>
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-6 shadow-xl shadow-blue-600/20 flex items-center gap-3 transition-transform duration-200 hover:-translate-y-1 group">
                <Link href="/register">
                  Mulai Sekarang
                  <div className="bg-white text-blue-600 p-1 rounded-full group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </Button>
              <a href="#fitur" className="inline-flex items-center gap-1.5 font-bold text-[#0F172A] hover:text-blue-600 transition-colors group">
                Pelajari lebih lanjut <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>

            {/* Feature Mini Row */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-200/80 pt-8 w-full">
              <div className="flex items-center gap-3 group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Pahami Pola</span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">Berbasis data akurat</span>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Kelola Waktu</span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">Gunakan screen time dengan bijak</span>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Hidup Seimbang</span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">Fokus setiap hari</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Graphic Right (Dashboard Floating Mockup) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 relative flex justify-center lg:justify-end mt-12 lg:mt-0"
          >
            <div className="absolute right-[-4%] top-[-10%] w-32 h-48 bg-linear-to-b from-emerald-200/20 to-transparent rounded-full blur-xl transform rotate-45 pointer-events-none" />

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full max-w-155 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 ease-out relative overflow-hidden group"
            >
              <img
                src="/digital-habit/dash-harian.png"
                alt="Digital Habit Dashboard Mockup"
                className="w-full h-auto rounded-2xl border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] bg-white/90 backdrop-blur-md"
              />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none rounded-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ================= INTERACTIVE TABS SHOWCASE SECTION (MULTI-SCREEN) ================= */}
      <section id="fitur" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-4">
              Cara Kerja Digital Habit
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Berbagai fitur untuk membantumu mengelola waktu digital dengan lebih baik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Kiri: Daftar Interactive Tabs */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {highlightFeatures.map((feature) => {
                const isActive = activeFeature === feature.id
                return (
                  <div
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`flex flex-col text-left p-6 rounded-2xl transition-all duration-300 border-2 cursor-pointer ${
                      isActive 
                        ? "bg-[#F4F7FC] border-blue-600 shadow-lg shadow-blue-600/10 scale-[1.02]" 
                        : "bg-transparent border-transparent hover:bg-[#F4F7FC]/60 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center size-10 rounded-xl transition-colors ${
                          isActive ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                        }`}>
                          <feature.icon className="size-5" />
                        </div>
                        <h3 className={`font-bold text-lg transition-colors ${isActive ? "text-blue-600" : "text-[#0F172A]"}`}>
                          {feature.title}
                        </h3>
                      </div>
                      {isActive && (
                        <ChevronRight className="size-5 text-blue-600 animate-pulse" />
                      )}
                    </div>
                    
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-slate-500 leading-relaxed mt-3 pl-1 mb-4">
                            {feature.description}
                          </p>

                          {/* SUB-TABS (PILLS) BANYAK GAMBAR */}
                          <div className="flex flex-wrap gap-2 mt-2 pl-1">
                            {feature.screens.map((screen, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation() // Mencegah klik tembus ke container parent
                                  setActiveScreenIndex(idx)
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  activeScreenIndex === idx
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "bg-slate-200/60 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {screen.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Kanan: Screenshot Showcase dengan Animasi Crossfade */}
            <div className="lg:col-span-7 relative h-95 sm:h-120 w-full bg-[#F4F7FC] rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${activeFeature}-${activeScreenIndex}`}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  src={currentImage}
                  alt={`${currentFeature?.title} - ${currentFeature?.screens[activeScreenIndex]?.label}`}
                  className="w-[90%] md:w-[85%] max-h-[90%] object-contain rounded-2xl shadow-2xl border border-slate-200/60 bg-white"
                />
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION 2: FITUR YANG MEMBANTUMU (Grid Simple) ================= */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Dirancang Untuk Kemudahan
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Segala yang kamu butuhkan untuk produktivitas yang lebih baik.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {[
            { icon: BarChart2, title: "Analisis Mendalam", desc: "Pahami pola penggunaan dengan visualisasi data yang intuitif." },
            { icon: FileText, title: "Catat dengan Mudah", desc: "Input aktivitas manual yang cepat dan sesuai kebutuhanmu." },
            { icon: Calendar, title: "Riwayat Lengkap", desc: "Lihat, kelola, dan ekspor data aktivitasmu kapan saja." },
            { icon: User, title: "Profil Personal", desc: "Personalisasi profil dan pantau statistik kebiasaanmu." }
          ].map((feature, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <div className="h-14 w-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#0F172A] mb-3">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= SECTION 3: BANNER CTA ================= */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden mt-10"
        >
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="hidden md:flex h-16 w-16 bg-white/10 backdrop-blur-sm rounded-full items-center justify-center text-3xl shadow-inner border border-white/20 shrink-0">
              🚀
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                Siap membangun kebiasaan digital yang sehat?
              </h3>
              <p className="text-sm text-blue-100 max-w-md">
                Gabung sekarang dan jadi versi terbaik dirimu, satu langkah kecil setiap harinya.
              </p>
            </div>
          </div>

          <Button asChild className="bg-white hover:bg-slate-50 text-blue-700 font-bold rounded-full px-8 py-6 shadow-lg flex items-center gap-2 shrink-0 transition-transform hover:scale-105 relative z-10">
            <Link href="/register">
              Mulai Gratis Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/60 relative z-10 py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="text-[11px] text-slate-500 font-medium">
            © 2026 Digital Habit. 
          </div>
        </div>
      </footer>

    </div>
  )
}