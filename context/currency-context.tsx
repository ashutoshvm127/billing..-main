'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'JPY' | 'CHF'

interface CurrencyContextType {
  selectedCurrency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void
  exchangeRates: Record<CurrencyCode, number>
  setExchangeRates: (rates: Record<CurrencyCode, number>) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'AUD': 'A$',
  'CAD': 'C$',
  'SGD': 'S$',
  'AED': 'د.إ',
  'JPY': '¥',
  'CHF': 'CHF'
}

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  'INR': 'Indian Rupee',
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'AUD': 'Australian Dollar',
  'CAD': 'Canadian Dollar',
  'SGD': 'Singapore Dollar',
  'AED': 'UAE Dirham',
  'JPY': 'Japanese Yen',
  'CHF': 'Swiss Franc'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>({
    'USD': 1,
    'INR': 83.2,
    'EUR': 0.92,
    'GBP': 0.79,
    'AUD': 1.53,
    'CAD': 1.36,
    'SGD': 1.34,
    'AED': 3.67,
    'JPY': 148.5,
    'CHF': 0.88
  })

  useEffect(() => {
    // Load saved currency preference
    const saved = localStorage.getItem('selectedCurrency')
    if (saved) setSelectedCurrency(saved as CurrencyCode)
    
    // Load saved Gemini API key
    const apiKey = localStorage.getItem('geminiApiKey')
    if (apiKey) setGeminiApiKey(apiKey)
  }, [])

  const handleSetCurrency = (currency: CurrencyCode) => {
    setSelectedCurrency(currency)
    localStorage.setItem('selectedCurrency', currency)
  }

  const handleSetGeminiKey = (key: string) => {
    setGeminiApiKey(key)
    localStorage.setItem('geminiApiKey', key)
  }

  const handleSetExchangeRates = (rates: Record<CurrencyCode, number>) => {
    setExchangeRates(rates)
    localStorage.setItem('exchangeRates', JSON.stringify(rates))
  }

  return (
    <CurrencyContext.Provider 
      value={{
        selectedCurrency,
        setCurrency: handleSetCurrency,
        geminiApiKey,
        setGeminiApiKey: handleSetGeminiKey,
        exchangeRates,
        setExchangeRates: handleSetExchangeRates
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
