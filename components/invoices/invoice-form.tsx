'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

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

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void
}

export default function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const { user } = useAuth()
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'sent' | 'paid' | 'overdue'>('overdue')
  const [currency, setCurrency] = useState('INR')

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  }

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}-${random}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientName || !clientEmail || !dueDate || items.some(item => !item.description || !item.rate)) {
      alert('Please fill in all required fields')
      return
    }

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: generateInvoiceNumber(),
      clientName,
      clientEmail,
      amount: calculateTotal(),
      status,
      dueDate,
      items,
      notes,
      createdAt: new Date().toISOString(),
      currency
    }

    onSubmit(invoice)

    // Reset form
    setClientName('')
    setClientEmail('')
    setDueDate('')
    setItems([{ description: '', quantity: 1, rate: 0 }])
    setNotes('')
    setStatus('overdue')
    setCurrency('INR')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Name *
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Company Name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Email *
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@company.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Due Date, Status, and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency *
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="INR">₹ INR (Indian Rupee)</option>
            <option value="USD">$ USD (US Dollar)</option>
            <option value="EUR">€ EUR (Euro)</option>
            <option value="GBP">£ GBP (British Pound)</option>
            <option value="AUD">A$ AUD (Australian Dollar)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'sent' | 'paid' | 'overdue')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="overdue">Final Bill (Unpaid/Overdue)</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Invoice Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Items *
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Item description"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="Qty"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                  placeholder="Rate"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="w-28 text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currency === 'INR' && '₹'}
                  {currency === 'USD' && '$'}
                  {currency === 'EUR' && '€'}
                  {currency === 'GBP' && '£'}
                  {currency === 'AUD' && 'A$'}
                  {(item.quantity * item.rate).toFixed(2)}
                </span>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="bg-gray-50 dark:bg-[#0F0F12] rounded-lg p-4 w-full md:w-64">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
            <span>Total:</span>
            <span>
              {currency === 'INR' && '₹'}
              {currency === 'USD' && '$'}
              {currency === 'EUR' && '€'}
              {currency === 'GBP' && '£'}
              {currency === 'AUD' && 'A$'}
              {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or terms..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          Create Invoice
        </button>
      </div>
    </form>
  )
}
