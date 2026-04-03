import { CurrencyCode } from '@/types/invoice'

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'د.إ',
  JPY: '¥',
  CHF: 'CHF',
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] || '$'
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`
}

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: Record<CurrencyCode, number>
): number {
  if (fromCurrency === toCurrency) return amount

  const fromRate = exchangeRates[fromCurrency]
  const toRate = exchangeRates[toCurrency]

  if (!fromRate || !toRate) return amount

  // Exchange rates are relative to USD (USD = 1), so normalize via USD.
  const amountInUsd = amount / fromRate
  return amountInUsd * toRate
}
