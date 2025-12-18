'use client'

interface AudioPlayerProps {
    src: string
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
    return (
        <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-2">Audio</p>
            <audio controls className="w-full h-10" src={src}>
                Your browser does not support the audio element.
            </audio>
        </div>
    )
}
