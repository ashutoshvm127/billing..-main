import { NextRequest, NextResponse } from 'next/server'
import { createSmtpTransporter } from '@/lib/mail'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { recipient } = await request.json()

    if (!recipient || typeof recipient !== 'string') {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    const { config, transporter } = createSmtpTransporter()

    const now = new Date().toISOString()
    const subject = `Test email from ${config.fromName}`
    const text = [
      'This is a test email from your billing app.',
      '',
      `Sent at: ${now}`,
      `Sender: ${config.fromName} <${config.from}>`,
      `Reply-To: ${config.replyTo}`,
      '',
      'If this lands in spam, check SPF, DKIM, DMARC, sender reputation, and mailbox rules.'
    ].join('\n')

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 8px;">Test Email</h2>
        <p>This is a test email from your billing app.</p>
        <ul>
          <li><strong>Sent at:</strong> ${now}</li>
          <li><strong>Sender:</strong> ${config.fromName} &lt;${config.from}&gt;</li>
          <li><strong>Reply-To:</strong> ${config.replyTo}</li>
        </ul>
        <p>If this lands in spam, check SPF, DKIM, DMARC, sender reputation, and mailbox rules.</p>
      </div>
    `

    await transporter.sendMail({
      from: `${config.fromName} <${config.from}>`,
      to: recipient,
      replyTo: config.replyTo,
      subject,
      text,
      html,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      recipient,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
