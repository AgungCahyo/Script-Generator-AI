import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminStorage: Storage | null = null

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
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
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

function getAdminStorage(): Storage {
    if (!adminStorage) {
        adminStorage = getStorage(getAdminApp())
    }
    return adminStorage
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

export { getAdminAuth as adminAuth, getAdminStorage as adminStorage }
