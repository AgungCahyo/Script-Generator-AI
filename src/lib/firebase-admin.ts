import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
}

// Initialize Firebase Admin
const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig, 'admin') : getApps()[0]
const adminAuth = getAuth(adminApp)

export async function verifyToken(token: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        return { uid: decodedToken.uid, email: decodedToken.email }
    } catch (error) {
        console.error('Error verifying token:', error)
        return null
    }
}

export { adminAuth }
