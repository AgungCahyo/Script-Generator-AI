import { NextRequest, NextResponse } from 'next/server'

// Redirect /api/billing/error to /payment/error page
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    // Build redirect URL with all query params
    const redirectUrl = new URL('/payment/error', request.url)
    searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
    })

    return NextResponse.redirect(redirectUrl)
}
