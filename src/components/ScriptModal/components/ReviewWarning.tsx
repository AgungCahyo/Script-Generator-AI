'use client'

import { AlertCircleOutline } from 'react-ionicons'

interface ReviewWarningProps {
    show: boolean
}

/**
 * Warning component displayed before generating TTS audio
 * Prompts user to review script for formatting issues
 */
export default function ReviewWarning({ show }: ReviewWarningProps) {
    if (!show) return null

    return (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircleOutline color="#d97706" width="18px" height="18px" cssClasses="mt-0.5 shrink-0" />
            <div className="flex-1">
                <p className="text-xs text-amber-800">
                    <strong>Cek dulu:</strong> Review script kamu sebelum generate audio, pastikan ga ada formatting issue kayak marker <code className="bg-amber-100 px-1 rounded text-[10px]">[Chapter: ...]</code>.
                </p>
            </div>
        </div>
    )
}
