'use client'

import { useAuth } from '@/context/auth-context'
import { X, Printer } from 'lucide-react'

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  amount: number
  status: 'sent' | 'paid' | 'overdue'
  dueDate: string
  items: InvoiceItem[]
  notes: string
  createdAt: string
  currency: string
}

interface InvoicePreviewProps {
  invoice: Invoice
  onClose: () => void
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const { user } = useAuth()

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'INR':
        return '₹'
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'AUD':
        return 'A$'
      default:
        return '$'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-gray-50 dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#2B2B30] p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-200 dark:hover:bg-[#2B2B30] rounded-lg transition"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-[#2B2B30] rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-12 bg-white dark:bg-[#1F1F23]">
          {/* Professional Invoice Template */}
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-12 pb-6 border-b border-gray-300 dark:border-[#2B2B30]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.companyName}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Professional Billing Software</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">INVOICE</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">#{invoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">From</h3>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.companyName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Bill To</h3>
                  <p className="font-semibold text-gray-900 dark:text-white">{invoice.clientName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.clientEmail}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Invoice Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>{invoice.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-[#2B2B30]">
                    <th className="text-left py-3 px-0 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Quantity</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Rate</th>
                    <th className="text-right py-3 px-0 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-[#2B2B30]">
                      <td className="py-4 px-0 text-gray-900 dark:text-white">{item.description}</td>
                      <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{getCurrencySymbol(invoice.currency)}{item.rate.toFixed(2)}</td>
                      <td className="py-4 px-0 text-right font-semibold text-gray-900 dark:text-white">
                        {getCurrencySymbol(invoice.currency)}{(item.quantity * item.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="flex justify-end mb-12">
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-sm border-b border-gray-200 dark:border-[#2B2B30] pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getCurrencySymbol(invoice.currency)}{invoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold bg-blue-50 dark:bg-blue-500/10 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Total Due:</span>
                  <span className="text-blue-600">{getCurrencySymbol(invoice.currency)}{invoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-gray-300 dark:border-[#2B2B30] pt-8">
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-300 dark:border-[#2B2B30]">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Thank you for your business. This invoice is due on {new Date(invoice.dueDate).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .fixed {
              position: static !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'text-green-600 dark:text-green-400'
    case 'sent':
      return 'text-blue-600 dark:text-blue-400'
    case 'overdue':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}
