'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LineItem, Invoice } from '@/types/invoice'
import { Plus, Trash2, Mail, Download, Eye } from 'lucide-react'
import InvoicePreview from './invoice-preview-enhanced'

export default function EnhancedInvoiceForm({ onSave, initialData, isQuote = false }: { onSave: (invoice: Invoice) => void, initialData?: Invoice, isQuote?: boolean }) {
  const [clients, setClients] = useState<any[]>([])
  const [gstSettings, setGstSettings] = useState<any>(null)
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [items, setItems] = useState<LineItem[]>(initialData?.items || [])
  const [showPreview, setShowPreview] = useState(false)
  const [sendEmail, setSendEmail] = useState(false)

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || (isQuote ? `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}` : `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`),
    clientName: initialData?.clientName || '',
    clientEmail: initialData?.clientEmail || '',
    clientPhone: initialData?.clientPhone || '',
    clientAddress: initialData?.clientAddress || '',
    dueDate: initialData?.dueDate || new Date(Date.now() + (isQuote ? 15 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: initialData?.notes || '',
    currency: initialData?.currency || 'INR',
    customTaxRate: initialData?.taxRate ?? -1, // -1 means use default from settings
  })

  useEffect(() => {
    const stored = localStorage.getItem('billingClients')
    setClients(stored ? JSON.parse(stored) : [])
    
    const storedGst = localStorage.getItem('gstSettings')
    setGstSettings(storedGst ? JSON.parse(storedGst) : {})

    const storedSettings = localStorage.getItem('gstSettings')
    if (storedSettings) {
      const settings = JSON.parse(storedSettings)
      setPaymentSettings(settings)
      // Set default currency from settings
      if (settings.defaultCurrency && !initialData?.currency) {
        setFormData(prev => ({ ...prev, currency: settings.defaultCurrency }))
      }
    }
  }, [])

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      type: 'product',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }
    setItems([...items, newItem])
  }

  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates }
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          updated.totalPrice = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxRate = formData.customTaxRate >= 0 ? formData.customTaxRate : (gstSettings?.gstRate || 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const invoice: Invoice = {
      id: initialData?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      amount: totalAmount,
      status: initialData?.status || 'sent',
      dueDate: formData.dueDate,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      items,
      notes: formData.notes,
      companyName: gstSettings?.companyName,
      companyEmail: gstSettings?.companyEmail,
      companyPhone: gstSettings?.companyPhone,
      companyAddress: gstSettings?.companyAddress,
      taxRate,
      subtotal,
      taxAmount,
      totalAmount,
      currency: formData.currency,
      upiId: paymentSettings?.upiId,
    }

    onSave(invoice)

    if (sendEmail) {
      try {
        await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice, email: formData.clientEmail })
        })
      } catch (error) {
        console.error('Failed to send email:', error)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Section */}
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Client Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name</label>
                <Input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  list="clients"
                  placeholder="Select or type client name"
                  required
                />
                <datalist id="clients">
                  {clients.map(client => (
                    <option key={client.id} value={client.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <Textarea
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Client address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Number</label>
                  <Input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2B2B30] rounded-lg"
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                    <option value="AUD">A$ AUD</option>
                    <option value="CAD">C$ CAD</option>
                    <option value="SGD">S$ SGD</option>
                    <option value="AED">د.إ AED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h3>
              <Button
                type="button"
                onClick={handleAddItem}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 py-8 text-center">No items added yet</p>
              )}

              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-[#0F0F12] p-4 rounded-lg border border-gray-200 dark:border-[#2B2B30] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <select
                        value={item.type}
                        onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as any })}
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2B2B30] rounded-lg text-sm"
                      >
                        <option value="product">Product</option>
                        <option value="service-hourly">Service (Hourly)</option>
                        <option value="service-daily">Service (Daily)</option>
                        <option value="service-monthly">Service (Monthly)</option>
                        <option value="maintenance-hourly">Maintenance (Hourly)</option>
                        <option value="maintenance-daily">Maintenance (Daily)</option>
                        <option value="maintenance-monthly">Maintenance (Monthly)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Unit Price</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Name - only show for product type */}
                  {item.type === 'product' && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                      <Input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                        placeholder="e.g., Software License, Hardware Kit"
                        className="mt-1"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.type === 'product' ? 'Description (Optional)' : 'Description *'}
                    </label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      placeholder={item.type === 'product' ? 'Additional details about this product...' : 'e.g., Web Development - 10 hours, Monthly Maintenance'}
                      rows={2}
                      className="mt-1"
                      required={item.type !== 'product'}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formData.currency === 'INR' && '₹'}
                        {formData.currency === 'USD' && '$'}
                        {formData.currency === 'EUR' && '€'}
                        {formData.currency === 'GBP' && '£'}
                        {formData.currency === 'AUD' && 'A$'}
                        {formData.currency === 'CAD' && 'C$'}
                        {formData.currency === 'SGD' && 'S$'}
                        {formData.currency === 'AED' && 'د.إ'}
                        {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Notes */}
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax Rate (%)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.customTaxRate >= 0 ? formData.customTaxRate : ''}
                    onChange={(e) => setFormData({ ...formData, customTaxRate: e.target.value === '' ? -1 : parseFloat(e.target.value) })}
                    placeholder={`Default: ${gstSettings?.gstRate || 0}%`}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for default rate, or enter 0 for no tax</p>
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-gray-50 dark:bg-[#0F0F12] rounded-lg p-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>{formData.currency === 'INR' ? '₹' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}{subtotal.toFixed(2)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax ({taxRate}%):</span>
                      <span>{formData.currency === 'INR' ? '₹' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span>Total:</span>
                    <span>{formData.currency === 'INR' ? '₹' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes for the client"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700 dark:text-gray-300">
                Send {isQuote ? 'quote' : 'invoice'} to client via email
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isQuote ? 'Save Quote' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="sticky top-4 h-fit">
          <InvoicePreview
            invoice={{
              id: initialData?.id || Date.now().toString(),
              invoiceNumber: formData.invoiceNumber,
              clientName: formData.clientName,
              clientEmail: formData.clientEmail,
              clientPhone: formData.clientPhone,
              clientAddress: formData.clientAddress,
              amount: totalAmount,
              status: initialData?.status || 'sent',
              dueDate: formData.dueDate,
              createdAt: initialData?.createdAt || new Date().toISOString(),
              items,
              notes: formData.notes,
              companyName: gstSettings?.companyName,
              companyEmail: gstSettings?.companyEmail,
              companyPhone: gstSettings?.companyPhone,
              companyAddress: gstSettings?.companyAddress,
              taxRate,
              subtotal,
              taxAmount,
              totalAmount,
              currency: formData.currency,
              upiId: paymentSettings?.upiId,
            }}
          />
        </div>
      )}
    </div>
  )
}
