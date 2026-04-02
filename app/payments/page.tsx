'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useEffect, useState } from "react"
import { Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react"

interface Payment {
  id: string
  invoiceNumber: string
  amount: number
  method: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  notes: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = localStorage.getItem('billingPayments')
    return stored ? JSON.parse(stored) : []
  })

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amount: 0,
    method: 'bank_transfer',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'completed' | 'pending' | 'failed',
    notes: ''
  })

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.invoiceNumber || !formData.amount) {
      alert('Invoice number and amount are required')
      return
    }

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    }

    const updated = [...payments, newPayment]
    setPayments(updated)
    localStorage.setItem('billingPayments', JSON.stringify(updated))

    // Reset form
    setFormData({
      invoiceNumber: '',
      amount: 0,
      method: 'bank_transfer',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: ''
    })
    setShowForm(false)
  }

  const handleDeletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id)
    setPayments(updated)
    localStorage.setItem('billingPayments', JSON.stringify(updated))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }))
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  return (
    <ProtectedLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Navigation */}
        <PageNavigation 
          title="Payments"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Payments' }
          ]}
        />

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Track and manage invoice payments</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5" />
            Record Payment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Payments</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${totalPayments.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{completedPayments}</p>
          </div>
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingPayments}</p>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Record New Payment</h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="INV-2024-0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="1000.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg border border-gray-200 dark:border-[#2B2B30] overflow-hidden animate-slide-up">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#2B2B30]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2B2B30]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{payment.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{payment.method.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {payment.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {payment.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                          {payment.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </ProtectedLayout>
  )
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
    case 'failed':
      return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400'
  }
}
