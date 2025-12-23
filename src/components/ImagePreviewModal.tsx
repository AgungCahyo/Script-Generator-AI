'use client'

import { CameraOutline, CloseOutline, DownloadOutline, SyncOutline } from 'react-ionicons'

interface ImagePreviewModalProps {
    imageUrl: string
    alt?: string
    photographer?: string
    onClose: () => void
    onDownload?: () => void
    isDownloading?: boolean
}

export function ImagePreviewModal({
    imageUrl,
    alt = 'Image preview',
    photographer,
    onClose,
    onDownload,
    isDownloading = false
}: ImagePreviewModalProps) {
    return (
        <div
            className="fixed inset-0 z-200 bg-black/90 flex items-center justify-center p-2 sm:p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
                <CloseOutline color="#fff" width="24px" height="24px" />
            </button>

            {/* Content Container */}
            <div
                className="w-full max-w-4xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image */}
                <div className="flex items-center justify-center overflow-hidden rounded-lg bg-black" style={{ maxHeight: 'calc(95vh - 120px)' }}>
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="w-full h-full max-w-full max-h-full object-contain rounded-lg"
                        style={{ maxHeight: 'calc(95vh - 120px)' }}
                    />
                </div>

                {/* Footer with info and buttons */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Info */}
                    {photographer && (
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <p className="text-white/60 text-sm flex items-center gap-1 justify-center sm:justify-start">
                                <CameraOutline color="#fff" width="16px" height="16px" />
                                {photographer}
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    {onDownload && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                {isDownloading ? (
                                    <SyncOutline color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                ) : (
                                    <DownloadOutline color="currentColor" width="16px" height="16px" />
                                )}
                                Download
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
