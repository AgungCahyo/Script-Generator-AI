'use client'

import { useState } from 'react'
import { DownloadOutline, PlayOutline, MusicalNotesOutline } from 'react-ionicons'

interface AudioPlayerProps {
    src: string
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
    const [showEmbed, setShowEmbed] = useState(false)

    // Check if it's a Google Drive URL
    const isGoogleDrive = src.includes('drive.google.com') || src.includes('googleapis.com')

    // Extract file ID from Google Drive URL
    const getFileId = (url: string) => {
        const match = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/)
        return match ? match[1] : null
    }

    // For Google Drive, show download button and embed option
    if (isGoogleDrive) {
        const fileId = getFileId(src)
        const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null

        return (
            <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-3">Audio</p>

                {/* Embed player */}
                {showEmbed && embedUrl && (
                    <div className="mb-3">
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="80"
                            allow="autoplay"
                            className="rounded-lg border border-neutral-200"
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEmbed(!showEmbed)}
                        className="flex-1 h-10 flex items-center justify-center gap-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        {showEmbed ? (
                            <>
                                <MusicalNotesOutline color="currentColor" width="16px" height="16px" />
                                Hide Player
                            </>
                        ) : (
                            <>
                                <PlayOutline color="currentColor" width="16px" height="16px" />
                                Play Audio
                            </>
                        )}
                    </button>
                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-4 flex items-center justify-center gap-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <DownloadOutline color="currentColor" width="16px" height="16px" />
                        Download
                    </a>
                </div>
            </div>
        )
    }

    // For data URLs or direct audio URLs, use native audio player
    return (
        <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-2">Audio</p>
            <audio controls className="w-full h-10" src={src}>
                Your browser does not support the audio element.
            </audio>
        </div>
    )
}
