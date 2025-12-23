import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'

// POST: Create payment checkout (trigger n8n webhook)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { credits } = body
        // credits: number of credits to purchase

        if (!credits || typeof credits !== 'number' || credits <= 0) {
            return NextResponse.json(
                { error: 'Invalid credits amount. Must be a positive number.' },
                { status: 400 }
            )
        }

        // Get n8n payment webhook URL
        const n8nWebhookUrl = process.env.N8N_PAYMENT_WEBHOOK_URL

        if (!n8nWebhookUrl) {
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            )
        }

        // Calculate price (Rp 2,000 per credit)
        const PRICE_PER_CREDIT = 2000
        const amount = credits * PRICE_PER_CREDIT
        const description = `${credits} Credits`

        // Construct callback URL (trim to remove any whitespace/newlines)
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
        const callbackUrl = `${appUrl}/api/billing/callback`

        // Call n8n payment webhook
        const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.uid,
                email: user.email,
                type: 'credits',
                amount,
                credits,
                description,
                callbackUrl,
            }),
        })

        if (!n8nResponse.ok) {
            console.error('n8n webhook failed:', await n8nResponse.text())
            return NextResponse.json(
                { error: 'Failed to create payment' },
                { status: 500 }
            )
        }

        const n8nData = await n8nResponse.json()

        // Expected response from n8n: { paymentUrl, orderId }
        if (!n8nData.paymentUrl || !n8nData.orderId) {
            console.error('Invalid n8n response:', n8nData)
            return NextResponse.json(
                { error: 'Invalid payment response' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            paymentUrl: n8nData.paymentUrl,
            orderId: n8nData.orderId,
            amount,
            credits,
            description,
        })
    } catch (error) {
        console.error('Error creating checkout:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
