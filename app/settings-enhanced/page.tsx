'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from '@/context/settings-context'
import { useState } from 'react'
import { Save, Settings2, FileText, Zap } from 'lucide-react'

export default function SettingsEnhancedPage() {
  const { gstSettings, setGSTSettings } = useSettings()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setGSTSettings(gstSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <ProtectedLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your billing preferences and company information</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-300 px-6 py-4 rounded-xl flex items-center gap-3">
            <Zap className="w-5 h-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Company Information */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-8 border border-gray-200 dark:border-[#2B2B30]">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Information</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <Input
                  type="text"
                  value={gstSettings.companyName}
                  onChange={(e) => setGSTSettings({ ...gstSettings, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Email *
                </label>
                <Input
                  type="email"
                  value={gstSettings.companyEmail}
                  onChange={(e) => setGSTSettings({ ...gstSettings, companyEmail: e.target.value })}
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Phone
                </label>
                <Input
                  type="tel"
                  value={gstSettings.companyPhone}
                  onChange={(e) => setGSTSettings({ ...gstSettings, companyPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GST Number
                </label>
                <Input
                  type="text"
                  value={gstSettings.gstNumber}
                  onChange={(e) => setGSTSettings({ ...gstSettings, gstNumber: e.target.value })}
                  placeholder="GST/Tax ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Address
              </label>
              <Textarea
                value={gstSettings.companyAddress}
                onChange={(e) => setGSTSettings({ ...gstSettings, companyAddress: e.target.value })}
                placeholder="Full company address"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Details (for invoices)
              </label>
              <Textarea
                value={gstSettings.bankDetails}
                onChange={(e) => setGSTSettings({ ...gstSettings, bankDetails: e.target.value })}
                placeholder="Bank name, Account number, IFSC code, etc."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UPI ID (for payment QR codes)
              </label>
              <Input
                type="text"
                value={gstSettings.upiId}
                onChange={(e) => setGSTSettings({ ...gstSettings, upiId: e.target.value })}
                placeholder="yourname@upi"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Add your UPI ID to generate payment QR codes on invoices for easy mobile payments
              </p>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-8 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Currency Settings</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Currency
                </label>
                <select 
                  value={gstSettings.defaultCurrency}
                  onChange={(e) => setGSTSettings({ ...gstSettings, defaultCurrency: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2B2B30] rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="AUD">A$ Australian Dollar (AUD)</option>
                  <option value="CAD">C$ Canadian Dollar (CAD)</option>
                  <option value="SGD">S$ Singapore Dollar (SGD)</option>
                  <option value="AED">د.إ UAE Dirham (AED)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This currency will be used by default on all new invoices
                </p>
              </div>
            </div>

            {/* Currency Info */}
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Note:</strong> You can change the currency for individual invoices. The default currency is used as a fallback when creating new invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-8 border border-gray-200 dark:border-[#2B2B30]">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tax Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GST Rate (%)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={gstSettings.gstRate}
                    onChange={(e) => setGSTSettings({ ...gstSettings, gstRate: parseFloat(e.target.value) })}
                    placeholder="18"
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This rate will be applied to all invoices by default
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Method
                </label>
                <select className="w-full px-4 py-2 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2B2B30] rounded-lg text-gray-900 dark:text-white">
                  <option>GST</option>
                  <option>VAT</option>
                  <option>HST</option>
                  <option>No Tax</option>
                </select>
              </div>
            </div>

            {/* Tax Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 p-6 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tax Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Example: Invoice with $1,000 subtotal</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                  <span>GST ({gstSettings.gstRate}%)</span>
                  <span>${(1000 * gstSettings.gstRate / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-blue-300 dark:border-blue-500/30 pt-2">
                  <span>Total</span>
                  <span>${(1000 + (1000 * gstSettings.gstRate / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Preferences */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-8 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#0F0F12] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
              <input
                type="checkbox"
                id="autoInvoice"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <label htmlFor="autoInvoice" className="text-gray-700 dark:text-gray-300">
                Auto-generate invoice numbers
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#0F0F12] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
              <input
                type="checkbox"
                id="sendReminders"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <label htmlFor="sendReminders" className="text-gray-700 dark:text-gray-300">
                Send payment reminders before due date
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#0F0F12] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
              <input
                type="checkbox"
                id="enableAI"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <label htmlFor="enableAI" className="text-gray-700 dark:text-gray-300">
                Enable AI-powered analytics and insights
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </ProtectedLayout>
  )
}
