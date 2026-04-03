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
  exchangeRatesUpdatedAt: string | null
  exchangeRatesSyncing: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
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
}

const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY', 'CHF']

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
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>(DEFAULT_EXCHANGE_RATES)
  const [exchangeRatesUpdatedAt, setExchangeRatesUpdatedAt] = useState<string | null>(null)
  const [exchangeRatesSyncing, setExchangeRatesSyncing] = useState(false)

  const parseGeminiRates = (rawText: string): Record<CurrencyCode, number> | null => {
    if (!rawText) return null

    const trimmed = rawText.trim()
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start < 0 || end < 0 || end <= start) return null

    try {
      const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>
      const next: Partial<Record<CurrencyCode, number>> = {}

      for (const currency of SUPPORTED_CURRENCIES) {
        const value = parsed[currency]
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
          return null
        }
        next[currency] = value
      }

      next.USD = 1
      return next as Record<CurrencyCode, number>
    } catch {
      return null
    }
  }

  const fetchRatesFromGemini = async (apiKey: string): Promise<Record<CurrencyCode, number> | null> => {
    if (!apiKey) return null

    const prompt = [
      'Return only a JSON object with exchange rates relative to USD base.',
      'Rules: USD must be 1, and all values must be numbers only (no strings).',
      'Include exactly these keys: USD, INR, EUR, GBP, AUD, CAD, SGD, AED, JPY, CHF.',
      'No markdown, no explanation, no extra keys.'
    ].join(' ')

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
            },
          }),
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || '')
        .join('')

      return parseGeminiRates(rawText || '')
    } catch {
      return null
    }
  }

  useEffect(() => {
    // Load saved currency preference
    const saved = localStorage.getItem('selectedCurrency')
    if (saved) setSelectedCurrency(saved as CurrencyCode)

    // Load saved exchange rates
    const savedRates = localStorage.getItem('exchangeRates')
    const savedRatesUpdatedAt = localStorage.getItem('exchangeRatesUpdatedAt')
    if (savedRates) {
      try {
        const parsed = JSON.parse(savedRates) as Record<string, unknown>
        const next: Partial<Record<CurrencyCode, number>> = {}
        for (const currency of SUPPORTED_CURRENCIES) {
          const value = parsed[currency]
          if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            next[currency] = value
          }
        }

        if (Object.keys(next).length === SUPPORTED_CURRENCIES.length) {
          next.USD = 1
          setExchangeRates(next as Record<CurrencyCode, number>)
          if (savedRatesUpdatedAt) {
            setExchangeRatesUpdatedAt(savedRatesUpdatedAt)
          }
        }
      } catch {
        // Ignore malformed local storage values.
      }
    }
    
    // Load saved Gemini API key
    const apiKey = localStorage.getItem('geminiApiKey')
    if (apiKey) setGeminiApiKey(apiKey)
  }, [])

  useEffect(() => {
    const syncRatesFromGemini = async () => {
      if (!geminiApiKey) return

      setExchangeRatesSyncing(true)
      const nextRates = await fetchRatesFromGemini(geminiApiKey)
      if (!nextRates) {
        setExchangeRatesSyncing(false)
        return
      }

      const updatedAt = new Date().toISOString()
      setExchangeRates(nextRates)
      setExchangeRatesUpdatedAt(updatedAt)
      setExchangeRatesSyncing(false)
      localStorage.setItem('exchangeRates', JSON.stringify(nextRates))
      localStorage.setItem('exchangeRatesUpdatedAt', updatedAt)
    }

    syncRatesFromGemini()
  }, [geminiApiKey])

  const handleSetCurrency = (currency: CurrencyCode) => {
    setSelectedCurrency(currency)
    localStorage.setItem('selectedCurrency', currency)
  }

  const handleSetGeminiKey = (key: string) => {
    setGeminiApiKey(key)
    localStorage.setItem('geminiApiKey', key)
  }

  const handleSetExchangeRates = (rates: Record<CurrencyCode, number>) => {
    const updatedAt = new Date().toISOString()
    setExchangeRates(rates)
    setExchangeRatesUpdatedAt(updatedAt)
    localStorage.setItem('exchangeRates', JSON.stringify(rates))
    localStorage.setItem('exchangeRatesUpdatedAt', updatedAt)
  }

  return (
    <CurrencyContext.Provider 
      value={{
        selectedCurrency,
        setCurrency: handleSetCurrency,
        geminiApiKey,
        setGeminiApiKey: handleSetGeminiKey,
        exchangeRates,
        setExchangeRates: handleSetExchangeRates,
        exchangeRatesUpdatedAt,
        exchangeRatesSyncing,
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
