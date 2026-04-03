export interface Payment {
  id: string
  invoiceNumber: string
  amount: number
  method: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  notes: string
  createdAt?: string
}

export interface Quote {
  id: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  amount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  expiryDate: string
  items: any[]
  notes: string
  createdAt: string
  currency: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  upiId?: string
  taxRate?: number
  subtotal?: number
  taxAmount?: number
  totalAmount?: number
  companyName?: string
}

export interface UserAccess {
  id: string
  email: string
  password: string
  role: 'admin' | 'user'
  accessLevel: 'full' | 'limited' | 'readonly'
  createdAt: string
  companyName?: string
}

export interface ReportSnapshot {
  id: string
  userId: string
  totalRevenue: number
  totalInvoices: number
  paidAmount: number
  pendingAmount: number
  amountCollected: number
  createdAt: string
}
