import { NextRequest, NextResponse } from 'next/server'
import { createSmtpTransporter } from '@/lib/mail'

export const runtime = 'nodejs'

type LineItem = {
  name?: string
  type?: string
  description?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

type InvoicePayload = {
  invoiceNumber?: string
  clientName?: string
  totalAmount?: number
  amount?: number
  subtotal?: number
  taxRate?: number
  taxAmount?: number
  currency?: string
  dueDate?: string
  items?: LineItem[]
  notes?: string
  companyName?: string
}

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

function isQuoteDocument(invoiceNumber?: string): boolean {
  return (invoiceNumber || '').startsWith('QT-')
}

function getDocumentLabel(invoiceNumber?: string): string {
  return isQuoteDocument(invoiceNumber) ? 'Quotation' : 'Invoice'
}

function formatAmount(amount: number | undefined, currency?: string): string {
  const symbol = getCurrencySymbol(currency)
  if (amount === undefined || amount === null) return `${symbol} -`
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildInvoiceText(invoice: InvoicePayload) {
  const docLabel = getDocumentLabel(invoice.invoiceNumber)
  const total = invoice.totalAmount ?? invoice.amount
  const lines = [
    `${docLabel} ${invoice.invoiceNumber ?? ''}`.trim(),
    '',
    `Client: ${invoice.clientName ?? '-'}`,
    `Total: ${formatAmount(total, invoice.currency)}`,
    `Due Date: ${invoice.dueDate ?? '-'}`,
  ]

  if (invoice.items && invoice.items.length > 0) {
    lines.push('', 'Items:', '')
    invoice.items.forEach((item, idx) => {
      const label = (item.type === 'product' && item.name) ? item.name : (item.description || '-')
      lines.push(`  ${idx + 1}. ${label} — Qty: ${item.quantity ?? 1} × ${formatAmount(item.unitPrice, invoice.currency)} = ${formatAmount(item.totalPrice, invoice.currency)}`)
    })
  }

  if (invoice.subtotal !== undefined) {
    lines.push('', `Subtotal: ${formatAmount(invoice.subtotal, invoice.currency)}`)
  }
  if (invoice.taxRate && invoice.taxRate > 0) {
    lines.push(`Tax (${invoice.taxRate}%): ${formatAmount(invoice.taxAmount, invoice.currency)}`)
  }
  lines.push(`Total: ${formatAmount(total, invoice.currency)}`)

  lines.push('', 'Thank you.')
  return lines.join('\n')
}

function buildInvoiceHtml(invoice: InvoicePayload) {
  const docLabel = getDocumentLabel(invoice.invoiceNumber)
  const total = invoice.totalAmount ?? invoice.amount
  const currSymbol = getCurrencySymbol(invoice.currency)

  let itemsHtml = ''
  if (invoice.items && invoice.items.length > 0) {
    const rows = invoice.items.map((item, idx) => {
      const label = (item.type === 'product' && item.name) ? item.name : (item.description || '-')
      const desc = (item.type === 'product' && item.name && item.description) ? `<div style="font-size: 11px; color: #888;">${item.description}</div>` : ''
      const typeLabel = (item.type || 'product').replace('-', ' ')
      return `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">
            <div style="font-weight: 500;">${label}</div>
            ${desc}
            <div style="font-size: 10px; color: #aaa; text-transform: capitalize;">${typeLabel}</div>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 13px;">${item.quantity ?? 1}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px;">${formatAmount(item.unitPrice, invoice.currency)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px; font-weight: 500;">${formatAmount(item.totalPrice, invoice.currency)}</td>
        </tr>
      `
    }).join('')

    itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Description</th>
            <th style="text-align: center; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; width: 60px;">Qty</th>
            <th style="text-align: right; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; width: 100px;">Rate</th>
            <th style="text-align: right; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; width: 100px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `
  }

  let totalsHtml = ''
  if (invoice.subtotal !== undefined) {
    totalsHtml += `
      <div style="display: flex; justify-content: flex-end;">
        <table style="width: 250px; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #666;">Subtotal</td>
            <td style="padding: 4px 0; text-align: right;">${formatAmount(invoice.subtotal, invoice.currency)}</td>
          </tr>
    `
    if (invoice.taxRate && invoice.taxRate > 0) {
      totalsHtml += `
          <tr>
            <td style="padding: 4px 0; color: #666;">Tax (${invoice.taxRate}%)</td>
            <td style="padding: 4px 0; text-align: right;">${formatAmount(invoice.taxAmount, invoice.currency)}</td>
          </tr>
      `
    }
    totalsHtml += `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; font-weight: 700; font-size: 14px;">Total</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 14px; color: #1e3a5f;">${formatAmount(total, invoice.currency)}</td>
          </tr>
        </table>
      </div>
    `
  }

  const dueDateFormatted = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-'

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1e3a5f;">${docLabel} ${invoice.invoiceNumber ?? ''}</h2>
        ${invoice.companyName ? `<p style="margin: 4px 0 0; color: #888; font-size: 13px;">From: ${invoice.companyName}</p>` : ''}
      </div>

      <p style="margin: 0 0 16px;">Please find your ${docLabel.toLowerCase()} details below.</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 480px; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>${docLabel} Number</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.invoiceNumber ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>Client</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.clientName ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>Total</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600; color: #1e3a5f;">${formatAmount(total, invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>Due Date</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${dueDateFormatted}</td>
        </tr>
      </table>

      ${itemsHtml}

      ${totalsHtml}

      ${invoice.notes ? `
        <div style="margin-top: 20px; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Notes</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #555;">${invoice.notes}</p>
        </div>
      ` : ''}

      <p style="margin-top: 24px; color: #888; font-size: 13px;">Thank you for your business.</p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const { invoice, email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    const { config, transporter } = createSmtpTransporter()
    const docLabel = getDocumentLabel(invoice?.invoiceNumber)

    await transporter.sendMail({
      from: `${config.fromName} <${config.from}>`,
      to: email,
      replyTo: config.replyTo,
      subject: `${docLabel} ${invoice?.invoiceNumber ?? ''} from ${config.fromName}`.trim(),
      text: buildInvoiceText((invoice ?? {}) as InvoicePayload),
      html: buildInvoiceHtml((invoice ?? {}) as InvoicePayload)
    })

    return NextResponse.json({
      success: true,
      message: `${docLabel} sent successfully`,
      invoiceNumber: invoice?.invoiceNumber
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
