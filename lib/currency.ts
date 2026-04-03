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
