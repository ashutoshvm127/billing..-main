'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Home } from 'lucide-react'

interface PageNavigationProps {
  title: string
  showBackButton?: boolean
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  onBack?: () => void
}

export function PageNavigation({
  title,
  showBackButton = true,
  breadcrumbs,
  onBack,
}: PageNavigationProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleHome = () => {
    router.push('/dashboard')
  }

  return (
    <div className="mb-6">
      {/* Navigation buttons */}
      <div className="flex items-center gap-3 mb-4">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2B2B30] hover:bg-gray-50 dark:hover:bg-[#2B2B30] transition"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Back</span>
          </button>
        )}
        
        <button
          onClick={handleHome}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2B2B30] hover:bg-gray-50 dark:hover:bg-[#2B2B30] transition"
          title="Go to dashboard"
        >
          <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Home</span>
        </button>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {breadcrumb.href ? (
                <a
                  href={breadcrumb.href}
                  className="hover:text-gray-900 dark:hover:text-white transition"
                >
                  {breadcrumb.label}
                </a>
              ) : (
                <span>{breadcrumb.label}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-balance">
        {title}
      </h1>
    </div>
  )
}
