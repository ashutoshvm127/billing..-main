'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2, Eye, Download, Mail } from "lucide-react"
import EnhancedInvoiceForm from "@/components/invoices/enhanced-invoice-form"
import InvoicePreview from "@/components/invoices/invoice-preview-enhanced"
import { Invoice } from "@/types/invoice"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useBillingRealtime } from "@/hooks/use-billing-realtime"
import { BILLING_DATA_CHANGE_KEY, deleteInvoice, getInvoices, upsertInvoice } from "@/lib/billing-store"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'final-bill' | 'paid'>('all')

  const loadInvoices = useCallback(async () => {
    if (!user?.id) return
    const loaded = await getInvoices(user.id)
    setInvoices(loaded)
  }, [user?.id])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  useBillingRealtime(user?.id, ['invoices', 'payments', 'quotes'], loadInvoices)

  useEffect(() => {
    const onBillingDataChanged = (event?: Event) => {
      if (event instanceof StorageEvent && event.key !== BILLING_DATA_CHANGE_KEY) return
      loadInvoices()
    }

    const onWindowFocus = () => {
      loadInvoices()
    }

    window.addEventListener('billing:data-changed', onBillingDataChanged as EventListener)
    window.addEventListener('storage', onBillingDataChanged as EventListener)
    window.addEventListener('focus', onWindowFocus)

    return () => {
      window.removeEventListener('billing:data-changed', onBillingDataChanged as EventListener)
      window.removeEventListener('storage', onBillingDataChanged as EventListener)
      window.removeEventListener('focus', onWindowFocus)
    }
  }, [loadInvoices])
  
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleAddInvoice = async (newInvoice: Invoice) => {
    if (!user?.id) return

    const existing = invoices.find(inv => inv.id === newInvoice.id)
    let updated
    if (existing) {
      updated = invoices.map(inv => inv.id === newInvoice.id ? newInvoice : inv)
    } else {
      updated = [...invoices, newInvoice]
    }

    await upsertInvoice(user.id, newInvoice)
    setInvoices(updated)
    setShowForm(false)
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!user?.id) return

    const updated = invoices.filter(inv => inv.id !== id)
    await deleteInvoice(user.id, id)
    setInvoices(updated)
  }

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, email: invoice.clientEmail })
      })
      alert('Invoice sent successfully!')
    } catch (error) {
      alert('Failed to send invoice')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPreview(true)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create a simple text-based PDF export
    const content = generateInvoiceText(invoice)
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `Invoice-${invoice.invoiceNumber}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter === 'paid') return invoice.status === 'paid'
    if (statusFilter === 'final-bill') return invoice.status === 'overdue' || invoice.status === 'sent'
    return true
  })

  const totalFinalBills = invoices.filter((invoice) => invoice.status === 'overdue' || invoice.status === 'sent').length
  const totalPaid = invoices.filter((invoice) => invoice.status === 'paid').length

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <PageNavigation 
          title="Invoices"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Invoices' }
          ]}
        />

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Manage and create professional invoices</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Invoice</h2>
            <EnhancedInvoiceForm onSave={handleAddInvoice} />
          </div>
        )}

        {/* Invoice Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2B2B30]'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('final-bill')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === 'final-bill'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2B2B30]'
            }`}
          >
            Final Bills Pending ({totalFinalBills})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2B2B30]'
            }`}
          >
            Paid ({totalPaid})
          </button>
        </div>

        {/* Invoice List */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg border border-gray-200 dark:border-[#2B2B30] overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {invoices.length === 0
                  ? 'No invoices yet. Create your first invoice!'
                  : 'No invoices found for the selected filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#2B2B30]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2B2B30]">
                  {filteredInvoices.map((invoice) => {
                    const dueTiming = getDueTiming(invoice)

                    return <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.clientName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{getCurrencySymbol(invoice.currency)}{invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                        <div className={`text-xs mt-1 ${dueTiming.className}`}>{dueTiming.label}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-lg transition"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-lg transition"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#2B2B30] bg-white dark:bg-[#1F1F23]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <InvoicePreview invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}


    </ProtectedLayout>
  )
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

function getCurrencySymbol(currency?: string): string {
  const symbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'AED': 'د.إ'
  }
  return symbols[currency || 'INR'] || '₹'
}

function getStatusStyles(status: string) {
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

function generateInvoiceText(invoice: Invoice): string {
  return `
PROFESSIONAL INVOICE

Invoice Number: ${invoice.invoiceNumber}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

BILL TO:
${invoice.clientName}
${invoice.clientEmail}

INVOICE ITEMS:
${invoice.items.map((item, i) => `${i + 1}. ${item.description} - Qty: ${item.quantity} x $${item.rate.toFixed(2)} = $${(item.quantity * item.rate).toFixed(2)}`).join('\n')}

TOTAL AMOUNT: $${invoice.amount.toFixed(2)}
Status: ${invoice.status}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}
  `.trim()
}
