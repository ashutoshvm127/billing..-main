'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Send, Printer } from 'lucide-react'
import { Invoice } from '@/types/invoice'

const getCurrencySymbol = (currency?: string): string => {
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

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const isQuote = (invoice.invoiceNumber || '').startsWith('QT-')
  const docLabel = isQuote ? 'Quotation' : 'Invoice'

  useEffect(() => {
    if (invoice.upiId) {
      const upiString = `upi://pay?pa=${invoice.upiId}&pn=${encodeURIComponent(invoice.companyName || docLabel)}&am=${invoice.totalAmount}&tn=${encodeURIComponent(`${docLabel} ${invoice.invoiceNumber}`)}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiString)}`
      setQrCodeUrl(qrUrl)
    }
  }, [invoice])

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current
    if (!element) return

    const options = {
      margin: 10,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }

    try {
      setIsGeneratingPdf(true)

      // Allow React to paint the centered PDF watermark before capture starts.
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))

      const { default: html2pdf } = await import('html2pdf.js')
      await html2pdf().set(options).from(element).save()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice,
          email: invoice.clientEmail
        })
      })

      if (response.ok) {
        alert(`${docLabel} sent successfully!`)
      } else {
        alert(`Failed to send ${docLabel.toLowerCase()}`)
      }
    } catch (error) {
      console.error(`Error sending ${docLabel.toLowerCase()}:`, error)
      alert(`Error sending ${docLabel.toLowerCase()}`)
    }
  }

  const currencySymbol = getCurrencySymbol(invoice.currency)
  const isPaid = invoice.status === 'paid'
  const isOverdue = invoice.status === 'overdue'

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap print:hidden">
        <Button onClick={handleDownloadPDF} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handlePrint} size="sm" variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleSendEmail} size="sm" variant="outline">
          <Send className="w-4 h-4 mr-2" />
          Send Email
        </Button>
      </div>

      <div 
        ref={invoiceRef} 
        className="bg-white text-gray-900 print:p-0 relative" 
        style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', fontSize: '12px' }}
      >
        {/* Watermarks */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.055,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src="/logo.png"
            alt=""
            style={{
              width: isGeneratingPdf ? '390px' : '350px',
              height: isGeneratingPdf ? '390px' : '350px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
          
          {/* Header - Logo and Invoice Title */}
          <div style={{ marginBottom: '40px' }}>
            {/* Top Section - Logo Only */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  style={{ height: '80px', width: 'auto' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              
              {/* Right Section - Invoice Type and Number */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: '600' }}>
                  {docLabel}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f', marginBottom: '2px', letterSpacing: '-0.5px' }}>
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>
            
            {/* Divider - Subtle accent line */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, #1e3a5f 0%, #1e3a5f80 50%, transparent 100%)', marginBottom: '0' }}></div>
          </div>

          {/* Invoice Details Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            
            {/* Bill To */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '600' }}>
                Bill To
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>
                {invoice.clientName || '—'}
              </div>
              {invoice.clientAddress && (
                <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.5', maxWidth: '250px' }}>
                  {invoice.clientAddress}
                </div>
              )}
              {invoice.clientEmail && (
                <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  {invoice.clientEmail}
                </div>
              )}
              {invoice.clientPhone && (
                <div style={{ fontSize: '11px', color: '#555' }}>
                  {invoice.clientPhone}
                </div>
              )}
            </div>

            {/* Invoice Info */}
            <div style={{ textAlign: 'right' }}>
              <table style={{ fontSize: '11px', marginLeft: 'auto' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#666', padding: '3px 12px 3px 0', textAlign: 'left' }}>{isQuote ? 'Quote' : 'Invoice'} Date:</td>
                    <td style={{ fontWeight: '500', color: '#111' }}>
                      {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#666', padding: '3px 12px 3px 0', textAlign: 'left' }}>Due Date:</td>
                    <td style={{ fontWeight: '500', color: isOverdue ? '#dc2626' : '#111' }}>
                      {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#666', padding: '3px 12px 3px 0', textAlign: 'left' }}>Status:</td>
                    <td>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        backgroundColor: isPaid ? '#dcfce7' : isOverdue ? '#fee2e2' : invoice.status === 'sent' ? '#dbeafe' : '#fef3c7',
                        color: isPaid ? '#166534' : isOverdue ? '#991b1b' : invoice.status === 'sent' ? '#1e40af' : '#92400e'
                      }}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' }}>
                  Description
                </th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '10px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '60px' }}>
                  Qty
                </th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '10px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '100px' }}>
                  Rate
                </th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '10px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '100px' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#333' }}>
                      {/* Show name only for products, otherwise show description */}
                      {item.type === 'product' && item.name ? (
                        <>
                          <div style={{ fontWeight: '500' }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{item.description}</div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontWeight: '500' }}>{item.description || '—'}</div>
                      )}
                      <div style={{ fontSize: '9px', color: '#aaa', marginTop: '3px', textTransform: 'capitalize' }}>
                        {item.type?.replace('-', ' ')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#333' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#333' }}>
                      {currencySymbol}{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: '#111', fontWeight: '500' }}>
                      {currencySymbol}{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ color: '#333' }}>{currencySymbol}{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#666' }}>Tax ({invoice.taxRate}%)</span>
                  <span style={{ color: '#333' }}>{currencySymbol}{invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', fontWeight: '700' }}>
                <span style={{ color: '#111' }}>Total</span>
                <span style={{ color: '#1e3a5f' }}>{currencySymbol}{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes & UPI Payment */}
          {(invoice.notes || qrCodeUrl) && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {invoice.notes && (
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '600' }}>
                    Notes
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
                    {invoice.notes}
                  </div>
                </div>
              )}

              {qrCodeUrl && (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '80px', height: '80px' }} />
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '6px' }}>
                    Scan to Pay
                  </div>
                  <div style={{ fontSize: '8px', color: '#888', fontFamily: 'monospace' }}>
                    {invoice.upiId}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#888' }}>
              Thank you for your business
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body { background: white; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  )
}
