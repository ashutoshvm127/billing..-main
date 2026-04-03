'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { findUserByCredentials } from '@/lib/billing-store'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  companyName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users - admin123@admin.com/admin123 and demo@demo.com/demo
const VALID_USERS = [
  { email: 'admin123@admin.com', password: 'admin123', id: 'admin-001', role: 'admin' as const },
  { email: 'demo@demo.com', password: 'demo', id: 'user-001', role: 'user' as const },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('billingUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('billingUser')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // First check against demo users
    let validUser: any = VALID_USERS.find(u => u.email === email && u.password === password)

    // Then check custom users from Supabase/local storage adapter.
    if (!validUser) {
      validUser = await findUserByCredentials(email, password)
    }
    
    if (validUser) {
      const user: User = {
        id: validUser.id,
        email: validUser.email,
        role: validUser.role,
        companyName: validUser.companyName || 'Cortexio',
      }
      localStorage.setItem('billingUser', JSON.stringify(user))
      setUser(user)
    } else {
      throw new Error('Invalid email or password')
    }
  }

  const logout = () => {
    localStorage.removeItem('billingUser')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
