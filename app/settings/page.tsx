'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useAuth } from "@/context/auth-context"
import { useCurrency } from "@/context/currency-context"
import { useSettings } from "@/context/settings-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Lock, Building2, Bell, Trash2, DollarSign, CreditCard, Zap } from "lucide-react"

interface PaymentSettings {
  upiId: string
  defaultCurrency: string
  bankName?: string
  bankAccountNumber?: string
}

interface CompanySettings {
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  signature?: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { geminiApiKey, setGeminiApiKey, selectedCurrency, setCurrency } = useCurrency()
  const { paymentSettings, setPaymentSettings, companySettings, setCompanySettings, notificationSettings, setNotificationSettings } = useSettings()
  const router = useRouter()
  const [savedMessage, setSavedMessage] = useState('')
  const [geminiKey, setGeminiKeyLocal] = useState(geminiApiKey)
  const [showSettingsSavedModal, setShowSettingsSavedModal] = useState(false)

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    })
    setSavedMessage('Settings updated')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handlePaymentSettingsSave = () => {
    setPaymentSettings(paymentSettings)
    setSavedMessage('Payment settings saved')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleGeminiKeySave = () => {
    setGeminiApiKey(geminiKey)
    setSavedMessage('Gemini API key saved')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleCurrencyChange = (currency: any) => {
    setCurrency(currency)
    setSavedMessage('Currency preference updated')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handlePaymentSettingChange = (key: keyof PaymentSettings, value: string) => {
    setPaymentSettings({
      ...paymentSettings,
      [key]: value
    })
  }

  const handleCompanySettingChange = (key: keyof CompanySettings, value: string) => {
    setCompanySettings({
      ...companySettings,
      [key]: value
    })
  }

  const handleCompanySettingsSave = () => {
    setCompanySettings(companySettings)
    setShowSettingsSavedModal(true)
    setTimeout(() => setShowSettingsSavedModal(false), 2000)
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const signature = event.target?.result as string
        setCompanySettings({
          ...companySettings,
          signature
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all billing data? This action cannot be undone.')) {
      localStorage.removeItem('billingInvoices')
      localStorage.removeItem('billingClients')
      localStorage.removeItem('billingPayments')
      setSavedMessage('All data cleared')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <PageNavigation 
          title="Settings"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings' }
          ]}
        />

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
            {savedMessage}
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-gray-400 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={user?.companyName || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-gray-400 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-gray-400 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Currency
              </label>
              <select
                value={paymentSettings.defaultCurrency}
                onChange={(e) => handlePaymentSettingChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UPI ID (for payment QR codes)
              </label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={paymentSettings.upiId}
                onChange={(e) => handlePaymentSettingChange('upiId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Leave empty to disable UPI QR codes on invoices</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="HDFC Bank"
                  value={paymentSettings.bankName || ''}
                  onChange={(e) => handlePaymentSettingChange('bankName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={paymentSettings.bankAccountNumber || ''}
                  onChange={(e) => handlePaymentSettingChange('bankAccountNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handlePaymentSettingsSave}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Save Payment Settings
            </button>
          </div>
        </div>

        {/* Currency & Gemini Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Currency & Exchange Rates
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dashboard Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="AUD">A$ Australian Dollar (AUD)</option>
                <option value="CAD">C$ Canadian Dollar (CAD)</option>
                <option value="SGD">S$ Singapore Dollar (SGD)</option>
                <option value="AED">د.إ UAE Dirham (AED)</option>
                <option value="JPY">¥ Japanese Yen (JPY)</option>
                <option value="CHF">CHF Swiss Franc (CHF)</option>
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                All invoice totals are locked at creation time and won't change with exchange rate fluctuations.
              </p>
            </div>
            <button
              onClick={() => {
                setSavedMessage('Currency preference saved')
                setTimeout(() => setSavedMessage(''), 3000)
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Save Currency Settings
            </button>
          </div>
        </div>

        {/* Gemini AI Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Gemini AI Integration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiKey}
                onChange={(e) => setGeminiKeyLocal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Get your Gemini API key from <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Google AI Studio</a>
              </p>
            </div>
            <button
              onClick={handleGeminiKeySave}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Save Gemini API Key
            </button>
            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Note:</strong> Your Gemini API key is used to fetch current exchange rates for invoice conversion and generate insights. It's stored locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Company Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Email *
              </label>
              <input
                type="email"
                placeholder="info@cortexio.com"
                value={companySettings.companyEmail}
                onChange={(e) => handleCompanySettingChange('companyEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">This email will be used as the sender for all invoices and mail</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Phone (Optional)
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={companySettings.companyPhone || ''}
                onChange={(e) => handleCompanySettingChange('companyPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Address (Optional)
              </label>
              <textarea
                placeholder="123 Business St, City, State 12345"
                value={companySettings.companyAddress || ''}
                onChange={(e) => handleCompanySettingChange('companyAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Signature (Upload Image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {companySettings.signature && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0F0F12] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                  <img 
                    src={companySettings.signature} 
                    alt="Signature" 
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleCompanySettingsSave}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Save Company Settings
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2B2B30] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications for important events</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2B2B30] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Invoice Reminders</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get reminders about upcoming invoice due dates</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.invoiceReminders}
                onChange={() => handleNotificationChange('invoiceReminders')}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2B2B30] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Payment Updates</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications when payments are received</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.paymentUpdates}
                onChange={() => handleNotificationChange('paymentUpdates')}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2B2B30] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get a weekly summary of your billing activity</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReports}
                onChange={() => handleNotificationChange('weeklyReports')}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Security
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your account is secured with end-to-end encryption. Your data is never shared with third parties.
            </p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-500/20">
          <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-6 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Clear all your billing data. This action cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Settings Saved Modal */}
      {showSettingsSavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 shadow-2xl max-w-sm mx-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings Saved</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your settings have been saved successfully.</p>
          </div>
        </div>
      )}

    </ProtectedLayout>
  )
}
