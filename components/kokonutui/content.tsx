'use client'

import { Calendar, CreditCard, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useCurrency } from "@/context/currency-context"
import { useAuth } from "@/context/auth-context"
import { getInvoices } from "@/lib/billing-store"
import { BILLING_DATA_CHANGE_KEY } from "@/lib/billing-store"
import { useBillingRealtime } from "@/hooks/use-billing-realtime"
import { convertCurrency, formatCurrency } from "@/lib/currency"
import { CurrencyCode } from "@/types/invoice"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  status: string
  dueDate: string
  createdAt: string
  currency?: string
}

export default function Content() {
  const { user } = useAuth()
  const { selectedCurrency, exchangeRates } = useCurrency()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    overdueAmount: 0,
    unpaidCount: 0
  })

  const selectedCurrencyCode = selectedCurrency as CurrencyCode
  const toSelectedCurrency = (amount: number, sourceCurrency?: string) => {
    const fromCurrency = (sourceCurrency || 'INR') as CurrencyCode
    return convertCurrency(amount, fromCurrency, selectedCurrencyCode, exchangeRates)
  }
  const formatCurrencyForSelected = (amount: number, sourceCurrency?: string) =>
    formatCurrency(toSelectedCurrency(amount, sourceCurrency), selectedCurrencyCode)
  const formatInSelectedCurrency = (amount: number) =>
    formatCurrency(amount, selectedCurrencyCode)

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return

    const invoicesList = await getInvoices(user.id)
    setInvoices(invoicesList)

    // Revenue = only invoices that have been paid
    const totalRevenue = invoicesList
      .filter((inv: Invoice) => inv.status === 'paid')
      .reduce((sum: number, inv: Invoice) => sum + toSelectedCurrency(inv.amount, inv.currency), 0)
    // Overdue/Unpaid = all invoices that are NOT paid
    const unpaidInvoices = invoicesList.filter((inv: Invoice) => inv.status !== 'paid')
    const overdueAmount = unpaidInvoices
      .reduce((sum: number, inv: Invoice) => sum + toSelectedCurrency(inv.amount, inv.currency), 0)

    setStats({
      totalRevenue,
      totalInvoices: invoicesList.length,
      overdueAmount,
      unpaidCount: unpaidInvoices.length
    })
  }, [user?.id, selectedCurrencyCode, exchangeRates])

  useBillingRealtime(user?.id, ['invoices', 'payments', 'quotes'], loadDashboardData)

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    const onBillingDataChanged = (event?: Event) => {
      if (event instanceof StorageEvent && event.key !== BILLING_DATA_CHANGE_KEY) return
      loadDashboardData()
    }

    const onWindowFocus = () => {
      loadDashboardData()
    }

    window.addEventListener('billing:data-changed', onBillingDataChanged as EventListener)
    window.addEventListener('storage', onBillingDataChanged as EventListener)
    window.addEventListener('focus', onWindowFocus)

    return () => {
      window.removeEventListener('billing:data-changed', onBillingDataChanged as EventListener)
      window.removeEventListener('storage', onBillingDataChanged as EventListener)
      window.removeEventListener('focus', onWindowFocus)
    }
  }, [loadDashboardData])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-[#2B2B30] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Total Revenue ({selectedCurrency})</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{formatInSelectedCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/15 rounded-lg group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-[#2B2B30] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Total Invoices</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.totalInvoices}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Created this period</p>
            </div>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-[#2B2B30] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Unpaid ({selectedCurrency})</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{formatInSelectedCurrency(stats.overdueAmount)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{stats.unpaidCount} invoice{stats.unpaidCount !== 1 ? 's' : ''} pending payment</p>
            </div>
            <div className="p-2.5 bg-amber-100 dark:bg-amber-500/15 rounded-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices & Outstanding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 flex flex-col border border-gray-200/60 dark:border-[#2B2B30] shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Recent Invoices
          </h2>
          <div className="flex-1 space-y-3">
            {invoices.slice(-3).reverse().map((invoice, idx) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0F0F12] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition">
                <div>
                  {(() => {
                    const dueTiming = getDueTiming(invoice)
                    return (
                      <>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{invoice.clientName}</p>
                        <p className={`text-xs mt-1 ${dueTiming.className}`}>{dueTiming.label}</p>
                      </>
                    )
                  })()}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrencyForSelected(invoice.amount, invoice.currency)}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No invoices yet</p>
            )}
          </div>
          {invoices.length > 0 && (
            <Link href="/invoices" className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium">
              View all invoices →
            </Link>
          )}
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 flex flex-col border border-gray-200/60 dark:border-[#2B2B30] shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Outstanding Payments
          </h2>
          <div className="flex-1 space-y-3">
            {invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').slice(-3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
                <div>
                  {(() => {
                    const dueTiming = getDueTiming(invoice)
                    return (
                      <>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.clientName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        <p className={`text-xs mt-1 ${dueTiming.className}`}>{dueTiming.label}</p>
                      </>
                    )
                  })()}
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrencyForSelected(invoice.amount, invoice.currency)}</p>
              </div>
            ))}
            {invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No outstanding payments</p>
            )}
          </div>
          <Link href="/payments" className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium">
            Manage payments →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-[#2B2B30] shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/invoices" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-gray-200/60 dark:border-[#2B2B30] rounded-lg text-center transition-all hover:border-blue-300 dark:hover:border-blue-500/30 group">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Create Invoice</p>
          </Link>
          <Link href="/clients" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-gray-200/60 dark:border-[#2B2B30] rounded-lg text-center transition-all hover:border-emerald-300 dark:hover:border-emerald-500/30 group">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Add Client</p>
          </Link>
          <Link href="/payments" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-gray-200/60 dark:border-[#2B2B30] rounded-lg text-center transition-all hover:border-violet-300 dark:hover:border-violet-500/30 group">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">Record Payment</p>
          </Link>
          <Link href="/analytics" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-gray-200/60 dark:border-[#2B2B30] rounded-lg text-center transition-all hover:border-amber-300 dark:hover:border-amber-500/30 group">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">View Reports</p>
          </Link>
        </div>
      </div>


    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
    case 'sent':
      return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400'
    case 'overdue':
      return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400'
  }
}

function getDueTiming(invoice: Invoice): { label: string; className: string } {
  if (invoice.status === 'paid') {
    return { label: 'Paid', className: 'text-green-600 dark:text-green-400' }
  }

  const dueDate = new Date(invoice.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return { label: 'Invalid due date', className: 'text-gray-500 dark:text-gray-400' }
  }

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return {
      label: `Overdue by ${days} day${days === 1 ? '' : 's'}`,
      className: 'text-red-600 dark:text-red-400',
    }
  }

  if (diffDays === 0) {
    return { label: 'Due today', className: 'text-amber-600 dark:text-amber-400' }
  }

  return {
    label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
    className: 'text-blue-600 dark:text-blue-400',
  }
}

