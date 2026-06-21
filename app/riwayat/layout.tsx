import { AppSidebar } from "@/components/app-sidebar"
import { AuthCheck } from "@/components/auth-check"

export default function RiwayatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthCheck>
  )
}
