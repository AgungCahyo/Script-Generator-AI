import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { addCredits, PLAN_LIMITS } from '@/lib/credits'

// POST: Handle payment callback from Midtrans OR n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()


        // Handle Midtrans direct notification format
        // Midtrans sends different formats for different notification types:
        // 1. Transaction: {transaction_status, order_id, gross_amount, ...}
        // 2. Subscription: {token, status, schedule, customer_details, amount, merchant_id, ...}
        if (body.transaction_status || body.order_id || body.token || body.merchant_id) {

            // Just acknowledge receipt - actual processing happens via n8n
            // n8n will receive this notification, process it, and call this endpoint again
            // with the properly formatted data (userId, type, credits, etc.)
            return new NextResponse(JSON.stringify({
                success: true,
                message: 'Notification received',
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        // Handle n8n formatted callback
        const {
            userId,
            type,
            plan,
            packageSize,
            credits,
            status,
            orderId,
            transactionId,
        } = body


        // Validate required fields
        if (!userId || !type || !status || !orderId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Only process successful payments
        if (status !== 'success' && status !== 'settlement' && status !== 'capture') {
            return NextResponse.json(
                { error: 'Payment not successful', status },
                { status: 400 }
            )
        }

        // Check if this order has already been processed (idempotency)
        const existingTransaction = await prisma.creditTransaction.findFirst({
            where: {
                metadata: {
                    path: ['orderId'],
                    equals: orderId,
                },
            },
        })

        if (existingTransaction) {
            return NextResponse.json({
                success: true,
                message: 'Order already processed',
                duplicate: true,
            })
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Handle credit purchase
        if (type !== 'credits') {
            return NextResponse.json(
                { error: 'Invalid type. Only credit purchases are supported.' },
                { status: 400 }
            )
        }

        if (!credits || credits <= 0) {
            return NextResponse.json(
                { error: 'Invalid credits amount' },
                { status: 400 }
            )
        }

        // Check if this is user's first purchase (first-time buyer bonus)
        const previousPurchases = await prisma.creditTransaction.findMany({
            where: {
                userId,
                type: 'PURCHASE',
            },
        })

        const isFirstPurchase = previousPurchases.length === 0
        const bonusCredits = isFirstPurchase ? Math.floor(credits * 0.2) : 0 // 20% bonus
        const totalCredits = credits + bonusCredits

        // Add credits with bonus if applicable
        await addCredits(
            userId,
            totalCredits,
            'PURCHASE',
            isFirstPurchase
                ? `Purchased ${credits} credits + ${bonusCredits} first-time bonus`
                : `Purchased ${credits} credits`,
            { orderId, transactionId, packageSize, bonusCredits, isFirstPurchase }
        )

        return NextResponse.json({
            success: true,
            type: 'credits',
            creditsGranted: totalCredits,
            baseCredits: credits,
            bonusCredits: bonusCredits,
            isFirstPurchase,
        })
    } catch (error) {
        console.error('Error processing payment callback:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
