import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  user?: {
    name?: string
    email?: string
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:ml-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}