export default function LoadingScreen({ message = 'Loading...', subtitle = 'Please wait' }: { message?: string; subtitle?: string }) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
                </div>
                {/* Text */}
                <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-neutral-900">
                        {message}
                    </p>
                    <p className="text-xs text-neutral-500">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}
