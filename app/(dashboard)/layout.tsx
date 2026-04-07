import DriveInitializer from '@/components/drive-initializer'
import Sidebar from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Silently initializes Drive root folder structure on first login */}
      <DriveInitializer />
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
