import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminApp: App | null = null
let adminAuth: Auth | null = null

function getAdminApp(): App {
    if (!adminApp) {
        if (getApps().length === 0) {
            const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
                ?.replace(/\\n/g, '\n')
                ?.replace(/\n/g, '\n')

            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            }, 'admin')
        } else {
            adminApp = getApps()[0]
        }
    }
    return adminApp
}

function getAdminAuth(): Auth {
    if (!adminAuth) {
        adminAuth = getAuth(getAdminApp())
    }
    return adminAuth
}

export async function verifyToken(token: string) {
    try {
        const auth = getAdminAuth()
        const decodedToken = await auth.verifyIdToken(token)
        return { uid: decodedToken.uid, email: decodedToken.email }
    } catch (error) {
        console.error('Error verifying token:', error)
        return null
    }
}

export { getAdminAuth as adminAuth }
