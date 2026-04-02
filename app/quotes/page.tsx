'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Eye, Download } from "lucide-react"
import { EnhancedInvoiceForm } from "@/components/invoices/enhanced-invoice-form"
import InvoicePreview from "@/components/invoices/invoice-preview-enhanced"

interface Quote {
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    // Load quotes from localStorage
    const stored = localStorage.getItem('quotes')
    if (stored) {
      setQuotes(JSON.parse(stored))
    }
  }, [])

  const generateQuoteNumber = () => {
    return `QT-${Date.now().toString().slice(-8)}`
  }

  const handleSaveQuote = (formData: any) => {
    if (editingId) {
      const updated = quotes.map(q => q.id === editingId ? { ...formData, id: editingId } : q)
      setQuotes(updated)
      localStorage.setItem('quotes', JSON.stringify(updated))
      setEditingId(null)
    } else {
      const newQuote: Quote = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        quoteNumber: generateQuoteNumber(),
        createdAt: new Date().toISOString(),
      }
      const updated = [...quotes, newQuote]
      setQuotes(updated)
      localStorage.setItem('quotes', JSON.stringify(updated))
    }
    setShowForm(false)
  }

  const handleDeleteQuote = (id: string) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      const updated = quotes.filter(q => q.id !== id)
      setQuotes(updated)
      localStorage.setItem('quotes', JSON.stringify(updated))
    }
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingId(quote.id)
    setSelectedQuote(quote)
    setShowForm(true)
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
