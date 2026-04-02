"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import TopNav from "./top-nav"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-6 relative bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-[#0a0a10] dark:via-[#0d0d14] dark:to-[#0a1020]">
          {/* Animated gradient orbs for depth */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-400/15 dark:bg-indigo-500/8 rounded-full blur-[100px] translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-[80px] translate-x-1/2" />
          
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Cortexio logo watermark - bottom right */}
          <div 
            className="absolute bottom-4 right-4 w-[300px] h-[300px] bg-contain bg-no-repeat bg-center opacity-[0.06] dark:opacity-[0.04]"
            style={{ backgroundImage: 'url(/cortexio-bg.png)' }}
          />
          
          {/* Content */}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  )
}

