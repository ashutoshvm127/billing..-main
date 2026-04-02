import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { invoices, metrics } = await request.json()

    const prompt = `Analyze the following business billing data and provide insights:

Invoices: ${JSON.stringify(invoices, null, 2)}

Metrics: ${JSON.stringify(metrics, null, 2)}

Please provide:
1. Key financial insights
2. Revenue trends
3. Payment health assessment
4. Actionable recommendations for business growth
5. Risk factors to watch

Format the response in a clear, professional manner suitable for a business dashboard.`

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    })

    // Parse the response into structured insights
    const insights = {
      summary: result.text,
      generatedAt: new Date().toISOString(),
      timestamp: Date.now()
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: (error as Error).message },
      { status: 500 }
    )
  }
}
