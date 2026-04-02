'use client'

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')
    
    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error) {
      setError('Invalid email or password')
      console.error('Login failed:', error)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">Loading...</div>
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding with blurred background */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Blurred Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: 'url(/cortexio-bg.png)' }}
        />
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-white/30" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <Image
              src="/logo.png"
              alt="Cortexio Neural Technologies"
              width={220}
              height={220}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-[#1e3a5f] font-medium text-center mt-8 max-w-sm text-sm leading-relaxed bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2">
            Intelligent billing and invoicing solutions for modern businesses
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b] p-6">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Cortexio Neural Technologies"
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="w-full h-10 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                className="w-full h-10 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-10 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Demo: admin123 / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
