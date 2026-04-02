'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Layout from './kokonutui/layout'
import Image from 'next/image'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0a0a10] dark:to-[#0a1020]">
        <div className="animate-pulse-logo">
          <Image
            src="/logo.png"
            alt="Cortexio"
            width={150}
            height={150}
            className="object-contain"
            priority
          />
        </div>

        <style jsx>{`
          @keyframes pulse-logo {
            0%, 100% { opacity: 0.4; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1); }
          }
          .animate-pulse-logo {
            animation: pulse-logo 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Layout>{children}</Layout>
}
