import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'
import { CREDIT_PACKAGES } from '@/lib/constants/credits'

// Helper to get package price based on credit amount
// Note: credits should be validated before calling this function
function getPackagePrice(credits: number): number | null {
    const packages = CREDIT_PACKAGES as Record<string, { credits: number; priceIDR: number }>

    if (credits === packages.STARTER.credits) return packages.STARTER.priceIDR
    if (credits === packages.SMALL.credits) return packages.SMALL.priceIDR
    if (credits === packages.MEDIUM.credits) return packages.MEDIUM.priceIDR
    if (credits === packages.LARGE.credits) return packages.LARGE.priceIDR

    return null // Invalid package size
}

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

        // Validate credits is a number and positive
        if (!credits || typeof credits !== 'number' || credits <= 0) {
            return NextResponse.json(
                { error: 'Invalid credits amount. Must be a positive number.' },
                { status: 400 }
            )
        }

        // Validate it matches our available packages
        const validAmounts = [
            CREDIT_PACKAGES.STARTER.credits,
            CREDIT_PACKAGES.SMALL.credits,
            CREDIT_PACKAGES.MEDIUM.credits,
            CREDIT_PACKAGES.LARGE.credits,
        ] as const

        if (!validAmounts.includes(credits as any)) {
            return NextResponse.json(
                { error: `Invalid package size. Available: ${validAmounts.join(', ')} credits` },
                { status: 400 }
            )
        }

        // TypeScript now knows credits is one of the valid amounts
        const validatedCredits = credits as 100 | 500 | 1000 | 2500

        // Get package price (already validated above, so this won't be null)
        const amount = getPackagePrice(validatedCredits)

        if (!amount) {
            return NextResponse.json(
                { error: 'Invalid package configuration' },
                { status: 500 }
            )
        }

        const description = `${credits} Credits`

        // Get n8n payment webhook URL
        const n8nWebhookUrl = process.env.N8N_PAYMENT_WEBHOOK_URL

        if (!n8nWebhookUrl) {
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            )
        }

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
                finishUrl: `${appUrl}/payment/success`,
                errorUrl: `${appUrl}/payment/error`,
                unfinishUrl: `${appUrl}/payment/error`,
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
