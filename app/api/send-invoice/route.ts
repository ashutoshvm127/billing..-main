import { NextRequest, NextResponse } from 'next/server'
import { createSmtpTransporter } from '@/lib/mail'

export const runtime = 'nodejs'

type InvoicePayload = {
  invoiceNumber?: string
  clientName?: string
  total?: number
  currency?: string
  dueDate?: string
}

function buildInvoiceText(invoice: InvoicePayload) {
  return [
    `Invoice ${invoice.invoiceNumber ?? ''}`.trim(),
    '',
    `Client: ${invoice.clientName ?? '-'}`,
    `Total: ${invoice.currency ?? ''} ${invoice.total ?? '-'}`.trim(),
    `Due Date: ${invoice.dueDate ?? '-'}`,
    '',
    'Thank you.'
  ].join('\n')
}

function buildInvoiceHtml(invoice: InvoicePayload) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Invoice ${invoice.invoiceNumber ?? ''}</h2>
      <p style="margin: 0 0 12px;">Please find your invoice details below.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 480px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Invoice Number</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.invoiceNumber ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Client</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.clientName ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.currency ?? ''} ${invoice.total ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Due Date</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.dueDate ?? '-'}</td>
        </tr>
      </table>
      <p style="margin-top: 16px;">Thank you.</p>
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

    await transporter.sendMail({
      from: `${config.fromName} <${config.from}>`,
      to: email,
      replyTo: config.replyTo,
      subject: `Invoice ${invoice?.invoiceNumber ?? ''} from ${config.fromName}`.trim(),
      text: buildInvoiceText((invoice ?? {}) as InvoicePayload),
      html: buildInvoiceHtml((invoice ?? {}) as InvoicePayload)
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
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
