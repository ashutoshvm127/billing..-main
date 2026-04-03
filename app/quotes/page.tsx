'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useCallback, useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Eye, ReceiptText } from "lucide-react"
import EnhancedInvoiceForm from "@/components/invoices/enhanced-invoice-form"
import InvoicePreview from "@/components/invoices/invoice-preview-enhanced"
import { useAuth } from "@/context/auth-context"
import { Quote } from "@/types/billing"
import { BILLING_DATA_CHANGE_KEY, deleteQuote, getQuotes, upsertInvoice, upsertQuote } from "@/lib/billing-store"
import { Invoice } from "@/types/invoice"
import { useBillingRealtime } from "@/hooks/use-billing-realtime"

export default function QuotesPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState('')

  const loadQuotes = useCallback(async () => {
    if (!user?.id) return
    const loaded = await getQuotes(user.id)
    setQuotes(loaded)
  }, [user?.id])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  useEffect(() => {
    const onBillingDataChanged = (event?: Event) => {
      if (event instanceof StorageEvent && event.key !== BILLING_DATA_CHANGE_KEY) return
      loadQuotes()
    }

    const onWindowFocus = () => {
      loadQuotes()
    }

    window.addEventListener('billing:data-changed', onBillingDataChanged as EventListener)
    window.addEventListener('storage', onBillingDataChanged as EventListener)
    window.addEventListener('focus', onWindowFocus)

    return () => {
      window.removeEventListener('billing:data-changed', onBillingDataChanged as EventListener)
      window.removeEventListener('storage', onBillingDataChanged as EventListener)
      window.removeEventListener('focus', onWindowFocus)
    }
  }, [loadQuotes])

  const generateQuoteNumber = () => {
    return `QT-${Date.now().toString().slice(-8)}`
  }

  const handleSaveQuote = async (formData: any) => {
    if (!user?.id) return

    if (editingId) {
      const editedQuote = { ...formData, id: editingId } as Quote
      const updated = quotes.map(q => q.id === editingId ? editedQuote : q)
      await upsertQuote(user.id, editedQuote)
      setQuotes(updated)
      setEditingId(null)
    } else {
      const newQuote: Quote = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        quoteNumber: generateQuoteNumber(),
        createdAt: new Date().toISOString(),
      }
      await upsertQuote(user.id, newQuote)
      const updated = [...quotes, newQuote]
      setQuotes(updated)
    }
    setShowForm(false)
  }

  const handleDeleteQuote = async (id: string) => {
    if (!user?.id) return

    if (confirm('Are you sure you want to delete this quote?')) {
      await deleteQuote(user.id, id)
      const updated = quotes.filter(q => q.id !== id)
      setQuotes(updated)
    }
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingId(quote.id)
    setSelectedQuote(quote)
    setShowForm(true)
  }

  const handleMakeFinalBill = async (quote: Quote) => {
    if (!user?.id) return

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientAddress: quote.companyAddress || '',
      clientPhone: quote.companyPhone || '',
      amount: quote.totalAmount || quote.amount,
      status: 'sent',
      dueDate: quote.expiryDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      items: (quote.items || []) as any,
      notes: quote.notes,
      companyName: quote.companyName,
      companyEmail: quote.companyEmail,
      companyPhone: quote.companyPhone,
      companyAddress: quote.companyAddress,
      taxRate: quote.taxRate || 0,
      subtotal: quote.subtotal || quote.amount,
      taxAmount: quote.taxAmount || 0,
      totalAmount: quote.totalAmount || quote.amount,
      currency: (quote.currency || 'INR') as any,
      upiId: quote.upiId,
    }

    const updatedQuote: Quote = {
      ...quote,
      status: 'accepted',
    }

    await Promise.all([
      upsertInvoice(user.id, invoice),
      upsertQuote(user.id, updatedQuote),
    ])

    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updatedQuote : q)))
    setSavedMessage(`Final bill ${invoice.invoiceNumber} created from ${quote.quoteNumber}`)
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <PageNavigation 
          title="Quotes"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Quotes' }
          ]}
        />

        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">Manage your business quotations</p>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setSelectedQuote(null)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Create Quote
          </button>
        </div>

        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
            {savedMessage}
          </div>
        )}

        {showForm ? (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Quote' : 'Create New Quote'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <EnhancedInvoiceForm
              initialData={selectedQuote}
              onSave={handleSaveQuote}
              isQuote={true}
            />
          </div>
        ) : selectedQuote ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedQuote(null)}
              className="px-4 py-2 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition"
            >
              Back to Quotes
            </button>
            <InvoicePreview invoice={selectedQuote} />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-[#2B2B30]">
            {quotes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No quotes yet. Create your first quote to get started.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#2B2B30]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Quote #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-gray-200 dark:border-[#2B2B30] hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{quote.quoteNumber}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{quote.clientName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{quote.amount.toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(quote.expiryDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded-lg transition"
                          title="View Quote"
                        >
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleMakeFinalBill(quote)}
                          className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 rounded-lg transition"
                          title="Make Final Bill"
                        >
                          <ReceiptText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-500/10 rounded-lg transition"
                          title="Edit Quote"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
