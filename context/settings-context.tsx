'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface PaymentSettings {
  upiId: string
  defaultCurrency: string
  bankName?: string
  bankAccountNumber?: string
}

interface CompanySettings {
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  signature?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  invoiceReminders: boolean
  paymentUpdates: boolean
  weeklyReports: boolean
}

interface GSTSettings {
  gstRate: number
  gstNumber: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  bankDetails: string
  upiId: string
  defaultCurrency: string
}

interface SettingsContextType {
  paymentSettings: PaymentSettings
  setPaymentSettings: (settings: PaymentSettings) => void
  companySettings: CompanySettings
  setCompanySettings: (settings: CompanySettings) => void
  notificationSettings: NotificationSettings
  setNotificationSettings: (settings: NotificationSettings) => void
  gstSettings: GSTSettings
  setGSTSettings: (settings: GSTSettings) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '',
  defaultCurrency: 'INR',
  bankName: '',
  bankAccountNumber: '',
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  signature: '',
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  invoiceReminders: true,
  paymentUpdates: true,
  weeklyReports: false,
}

const DEFAULT_GST_SETTINGS: GSTSettings = {
  gstRate: 18,
  gstNumber: '',
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  bankDetails: '',
  upiId: '',
  defaultCurrency: 'INR',
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS)
  const [companySettings, setCompanySettingsState] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS)
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)
  const [gstSettings, setGSTSettingsState] = useState<GSTSettings>(DEFAULT_GST_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('paymentSettings')
        if (saved) setPaymentSettingsState(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading payment settings:', error)
      }

      try {
        const saved = localStorage.getItem('companySettings')
        if (saved) setCompanySettingsState(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading company settings:', error)
      }

      try {
        const saved = localStorage.getItem('notificationSettings')
        if (saved) setNotificationSettingsState(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }

      try {
        const saved = localStorage.getItem('gstSettings')
        if (saved) setGSTSettingsState(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading GST settings:', error)
      }
    }

    loadSettings()
  }, [])

  // Handle storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'paymentSettings' && e.newValue) {
        try {
          setPaymentSettingsState(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing payment settings from storage event:', error)
        }
      }

      if (e.key === 'companySettings' && e.newValue) {
        try {
          setCompanySettingsState(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing company settings from storage event:', error)
        }
      }

      if (e.key === 'notificationSettings' && e.newValue) {
        try {
          setNotificationSettingsState(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing notification settings from storage event:', error)
        }
      }

      if (e.key === 'gstSettings' && e.newValue) {
        try {
          setGSTSettingsState(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing GST settings from storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleSetPaymentSettings = useCallback((settings: PaymentSettings) => {
    setPaymentSettingsState(settings)
    localStorage.setItem('paymentSettings', JSON.stringify(settings))
  }, [])

  const handleSetCompanySettings = useCallback((settings: CompanySettings) => {
    setCompanySettingsState(settings)
    localStorage.setItem('companySettings', JSON.stringify(settings))
  }, [])

  const handleSetNotificationSettings = useCallback((settings: NotificationSettings) => {
    setNotificationSettingsState(settings)
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  }, [])

  const handleSetGSTSettings = useCallback((settings: GSTSettings) => {
    setGSTSettingsState(settings)
    localStorage.setItem('gstSettings', JSON.stringify(settings))
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        paymentSettings,
        setPaymentSettings: handleSetPaymentSettings,
        companySettings,
        setCompanySettings: handleSetCompanySettings,
        notificationSettings,
        setNotificationSettings: handleSetNotificationSettings,
        gstSettings,
        setGSTSettings: handleSetGSTSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
