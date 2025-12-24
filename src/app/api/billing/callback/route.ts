import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { addCredits, PLAN_LIMITS } from '@/lib/credits'
import crypto from 'crypto'

// Midtrans IP Whitelist (Production & Sandbox)
const MIDTRANS_IPS = [
    '103.127.16.0/23',   // Production
    '103.208.23.0/24',   // Production
    '103.208.22.0/24',   // Production  
    '103.127.17.6',      // Sandbox
    '180.131.6.100',     // Backup
]

// Helper: Check if IP is whitelisted
function isWhitelistedIP(ip: string | null): boolean {
    if (!ip) return false

    // For development, allow localhost
    if (process.env.NODE_ENV === 'development') {
        return true
    }

    // Check against whitelist
    return MIDTRANS_IPS.some(allowedIP => {
        if (allowedIP.includes('/')) {
            // CIDR range check (simplified)
            const [range] = allowedIP.split('/')
            return ip.startsWith(range.split('.').slice(0, 3).join('.'))
        }
        return ip === allowedIP
    })
}

// Helper: Verify Midtrans signature
function verifyMidtransSignature(body: any): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
        console.error('MIDTRANS_SERVER_KEY not configured')
        return false
    }

    const orderId = body.order_id
    const statusCode = body.status_code
    const grossAmount = body.gross_amount
    const signatureKey = body.signature_key

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
        return false
    }

    // Generate expected signature
    const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`
    const hash = crypto.createHash('sha512').update(signatureString).digest('hex')

    return hash === signatureKey
}

// POST: Handle payment callback from Midtrans OR n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Get client IP
        const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            || request.headers.get('x-real-ip')
            || 'unknown'

        // Handle Midtrans direct notification format
        if (body.transaction_status || body.order_id || body.token || body.merchant_id) {

            // Check if this is a test notification from Midtrans
            const isTestNotification = body.order_id?.includes('payment_notif_test')

            if (isTestNotification) {
                console.log(`📧 Midtrans test notification received from IP: ${clientIP}`)
                console.log('Test Order ID:', body.order_id)

                // Acknowledge test notification
                return new NextResponse(JSON.stringify({
                    success: true,
                    message: 'Test notification received successfully',
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }

            // For REAL transactions, enforce security checks

            // Security Check 1: IP Whitelist
            if (!isWhitelistedIP(clientIP)) {
                // Log for debugging but be more permissive in production initially
                console.warn(`Payment callback from non-whitelisted IP: ${clientIP}`)
                console.warn('Order ID:', body.order_id)

                // In production, still check signature even if IP not whitelisted
                // This allows Midtrans to change IPs without breaking payments
                if (process.env.NODE_ENV === 'production') {
                    console.warn('Proceeding with signature check despite IP mismatch')
                } else {
                    // In development, allow all IPs
                    console.log('Development mode: IP check bypassed')
                }
            }

            // Security Check 2: Signature Verification (CRITICAL!)
            if (!verifyMidtransSignature(body)) {
                console.error(`❌ Invalid Midtrans signature from IP: ${clientIP}`)
                console.error('Order ID:', body.order_id)
                console.error('Status Code:', body.status_code)
                console.error('Gross Amount:', body.gross_amount)
                console.error('Received Signature:', body.signature_key)

                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 403 }
                )
            }

            console.log(`✅ Valid Midtrans notification from IP: ${clientIP}, Order: ${body.order_id}`)

            // Valid Midtrans notification - acknowledge receipt
            // n8n will process this and call us back with formatted data
            return new NextResponse(JSON.stringify({
                success: true,
                message: 'Notification received and verified',
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
        const existingOrder = await prisma.creditTransaction.findFirst({
            where: {
                metadata: {
                    path: ['orderId'],
                    equals: orderId,
                },
            },
        })

        if (existingOrder) {
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

        // IDEMPOTENCY CHECK: Prevent duplicate processing of same orderId
        const existingPurchase = await prisma.creditTransaction.findFirst({
            where: {
                userId,
                type: 'PURCHASE',
                metadata: {
                    path: ['orderId'],
                    equals: orderId
                }
            }
        })

        if (existingPurchase) {
            console.log(`Order ${orderId} already processed, skipping duplicate`)
            // Return success to stop Midtrans retries
            return NextResponse.json({
                success: true,
                message: 'Order already processed',
                alreadyProcessed: true,
                credits: existingPurchase.amount
            })
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
