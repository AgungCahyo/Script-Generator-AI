import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'

/**
 * Extract and verify user from Authorization header
 * @param request - NextRequest with Authorization header
 * @returns User object or null if unauthorized
 */
export async function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }
    const token = authHeader.split('Bearer ')[1]
    return await verifyToken(token)
}
