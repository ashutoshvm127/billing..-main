'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CompanySettings {
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  signature?: string
}

interface EmailData {
  recipient: string
  subject: string
  message: string
  attachInvoice?: boolean
  invoiceNumber?: string
}

export default function MailPage() {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyEmail: '',
  })
  const [emailData, setEmailData] = useState<EmailData>({
    recipient: '',
    subject: '',
    message: '',
    attachInvoice: false,
    invoiceNumber: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    // Load company settings
    const companyStored = localStorage.getItem('companySettings')
    if (companyStored) {
      setCompanySettings(JSON.parse(companyStored))
    }

    // Load invoices and quotes for attachment
    const invoicesStored = localStorage.getItem('billingInvoices')
    const quotesStored = localStorage.getItem('quotes')
    const allDocuments = []
    
    if (invoicesStored) {
      try {
        allDocuments.push(...JSON.parse(invoicesStored).map((inv: any) => ({ ...inv, type: 'invoice' })))
      } catch (e) {
        console.error('Error loading invoices:', e)
      }
    }
    
    if (quotesStored) {
      try {
        allDocuments.push(...JSON.parse(quotesStored).map((q: any) => ({ ...q, type: 'quote' })))
      } catch (e) {
        console.error('Error loading quotes:', e)
      }
    }
    
    setInvoices(allDocuments)
  }, [])

  const handleSendEmail = async () => {
    if (!emailData.recipient || !emailData.subject || !emailData.message) {
      setMessage('Please fill in all required fields')
      return
    }

    if (!companySettings.companyEmail) {
      setMessage('Please configure your company email in settings first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: companySettings.companyEmail,
          to: emailData.recipient,
          subject: emailData.subject,
          message: emailData.message,
          attachInvoice: emailData.attachInvoice,
          invoiceNumber: emailData.attachInvoice ? emailData.invoiceNumber : null,
        })
      })

      if (response.ok) {
        setMessage('Email sent successfully!')
        setEmailData({ recipient: '', subject: '', message: '', attachInvoice: false })
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message || 'Failed to send email'}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setMessage('Error sending email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mail</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Send emails with your company header</p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Company Email Display */}
        {companySettings.companyEmail && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>From:</strong> {companySettings.companyEmail}
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
              Emails will be sent from your company email configured in settings.
            </p>
          </div>
        )}

        {/* Mail Composer */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Compose Email</h2>
          
          <div className="space-y-4">
            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Email *
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={emailData.recipient}
                onChange={(e) => setEmailData({ ...emailData, recipient: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                placeholder="Invoice for Project XYZ"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                placeholder="Write your message here..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Attach Invoice/Quote Option */}
            <div className="border-t border-gray-200 dark:border-[#2B2B30] pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailData.attachInvoice}
                  onChange={(e) => setEmailData({ ...emailData, attachInvoice: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attach Invoice or Quote (Optional)
                </span>
              </label>

              {emailData.attachInvoice && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice/Quote Number or ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., INV-123456 or QT-789012"
                    value={emailData.invoiceNumber || ''}
                    onChange={(e) => setEmailData({ ...emailData, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter the invoice or quote number to include in the email
                  </p>
                </div>
              )}
            </div>

            {/* Signature Preview */}
            {companySettings.signature && (
              <div className="border-t border-gray-200 dark:border-[#2B2B30] pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email Signature Preview:</p>
                <div className="bg-gray-50 dark:bg-[#0F0F12] p-4 rounded-lg border border-gray-200 dark:border-[#2B2B30]">
                  <img 
                    src={companySettings.signature} 
                    alt="Company Signature" 
                    className="h-12 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Template Examples */}
        <div className="bg-gray-50 dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Email Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#1F1F23] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Invoice Reminder</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Dear Client, Please find attached your invoice. Payment is due by [DUE_DATE]. Thank you!
              </p>
              <button
                onClick={() => setEmailData({
                  ...emailData,
                  subject: 'Invoice Payment Reminder',
                  message: 'Dear Client,\n\nPlease find attached your invoice.\n\nPayment is due by [DUE_DATE].\n\nThank you for your business!\n\nBest regards,\nCortexio Team'
                })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Template
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-[#1F1F23] rounded-lg border border-gray-200 dark:border-[#2B2B30]">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Thank You</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Thank you for your business! We appreciate your trust and look forward to working with you again.
              </p>
              <button
                onClick={() => setEmailData({
                  ...emailData,
                  subject: 'Thank You for Your Business',
                  message: 'Dear Client,\n\nThank you for your business! We greatly appreciate your trust and look forward to working with you again in the future.\n\nIf you have any questions or concerns, please don\'t hesitate to reach out.\n\nBest regards,\nCortexio Team'
                })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
