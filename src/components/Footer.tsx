import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="max-w-3xl mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Links */}
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <Link href="/showcase" className="hover:text-neutral-900 transition-colors">
                            Showcase
                        </Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/pricing" className="hover:text-neutral-900 transition-colors">
                            Pricing
                        </Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/help" className="hover:text-neutral-900 transition-colors">
                            Panduan
                        </Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/terms" className="hover:text-neutral-900 transition-colors">
                            Terms
                        </Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
                            Privacy
                        </Link>
                        <span className="text-neutral-300">•</span>
                        <a href="mailto:agungcahyop29@gmail.com" className="hover:text-neutral-900 transition-colors">
                            Kontak
                        </a>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-neutral-400">
                        © 2024 ScriptAI
                    </p>
                </div>
            </div>
        </footer>
    )
}


