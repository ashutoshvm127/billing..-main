export type ChargeType = 'product' | 'service-hourly' | 'service-daily' | 'service-monthly' | 'maintenance-hourly' | 'maintenance-daily' | 'maintenance-monthly'
export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'JPY' | 'CHF'

export interface LineItem {
  id: string
  name?: string
  type: ChargeType
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  clientPhone: string
  amount: number
  status: 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
  createdBy?: string
  items: LineItem[]
  notes?: string
  companyName?: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  taxRate: number
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: CurrencyCode
  originalCurrency?: CurrencyCode
  exchangeRateAtCreation?: number
  upiId?: string
}

export interface GSTPSettings {
  gstRate: number
  gstNumber?: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  bankDetails?: string
  logo?: string
}
