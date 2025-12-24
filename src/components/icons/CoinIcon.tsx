export default function CoinIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Gradient definition for modern look */}
            <defs>
                <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#525252', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#171717', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Outer circle - main coin body */}
            <circle
                cx="12"
                cy="12"
                r="9.5"
                fill="url(#coinGradient)"
                stroke="#a3a3a3"
                strokeWidth="1"
            />

            {/* Inner highlight circle for depth */}
            <circle
                cx="12"
                cy="12"
                r="7"
                fill="none"
                stroke="#737373"
                strokeWidth="0.5"
                opacity="0.3"
            />

            {/* Currency symbol 'C' for Credits */}
            <text
                x="12"
                y="16.5"
                fontSize="11"
                fontWeight="700"
                fill="#ffffff"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
            >
                C
            </text>

            {/* Subtle shine effect */}
            <circle
                cx="9"
                cy="9"
                r="2"
                fill="#ffffff"
                opacity="0.15"
            />
        </svg>
    )
}
