import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { invoice, email } = await request.json()

    // Simulate sending email - in production, use Resend, SendGrid, etc.
    console.log(`Sending invoice ${invoice.invoiceNumber} to ${email}`)

    // For demo purposes, we'll just return success
    // In production, integrate with email service:
    // const response = await resend.emails.send({
    //   from: 'noreply@billsync.com',
    //   to: email,
    //   subject: `Invoice ${invoice.invoiceNumber}`,
    //   html: generateInvoiceHTML(invoice),
    //   attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }]
    // })

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      invoiceNumber: invoice.invoiceNumber
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
