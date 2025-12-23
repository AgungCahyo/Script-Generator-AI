import { NextRequest, NextResponse } from 'next/server'

// Redirect /api/billing/success to /payment/success page
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    // Build redirect URL with all query params
    const redirectUrl = new URL('/payment/success', request.url)
    searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
    })

    return NextResponse.redirect(redirectUrl)
}
