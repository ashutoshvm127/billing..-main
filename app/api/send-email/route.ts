import { NextRequest, NextResponse } from 'next/server'
import { createSmtpTransporter } from '@/lib/mail'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, invoiceNumber } = body

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { message: 'Recipient email is required' },
        { status: 400 }
      )
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { message: 'Subject is required' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: 'Message body is required' },
        { status: 400 }
      )
    }

    const { config, transporter } = createSmtpTransporter()

    // Build HTML version of the message with proper formatting
    const messageHtml = message
      .split('\n')
      .map((line: string) => (line.trim() === '' ? '<br/>' : `<p style="margin: 4px 0;">${line}</p>`))
      .join('')

    let footerHtml = ''
    if (invoiceNumber) {
      const docType = invoiceNumber.startsWith('QT-') ? 'Quote' : 'Invoice'
      footerHtml = `
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            Reference: ${docType} <strong>${invoiceNumber}</strong>
          </p>
        </div>
      `
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px;">
        ${messageHtml}
        ${footerHtml}
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 11px; color: #9ca3af;">
            Sent via ${config.fromName}
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `${config.fromName} <${config.from}>`,
      to,
      replyTo: config.replyTo,
      subject,
      text: message + (invoiceNumber ? `\n\nReference: ${invoiceNumber}` : ''),
      html,
    })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { message: error?.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
