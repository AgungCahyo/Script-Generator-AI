'use client'

import Link from 'next/link'
import { ArrowBack } from 'react-ionicons'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-neutral-200 sticky top-0 bg-white z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowBack width="16px" height="16px" />
                        Kembali
                    </Link>
                    <span className="text-xs text-neutral-400">Legal</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8 pb-6 border-b border-neutral-100">
                    <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Syarat dan Ketentuan Layanan</h1>
                    <p className="text-sm text-neutral-500">ScriptAI - Generator Skrip Video AI</p>
                    <p className="text-xs text-neutral-400 mt-1">Terakhir Diperbarui: 24 Desember 2024</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-sm leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">1. Penerimaan Syarat</h2>
                        <p className="text-neutral-600">
                            Dengan mengakses dan menggunakan layanan ScriptAI ("Layanan", "Platform", "kami"),
                            Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan
                            syarat ini, mohon untuk tidak menggunakan Layanan kami.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">2. Definisi</h2>
                        <ul className="space-y-2 text-neutral-600">
                            <li><span className="font-medium text-neutral-900">"Layanan":</span> Platform ScriptAI yang menyediakan generator skrip video berbasis AI</li>
                            <li><span className="font-medium text-neutral-900">"Pengguna" atau "Anda":</span> Individu atau entitas yang menggunakan Layanan kami</li>
                            <li><span className="font-medium text-neutral-900">"Kredit":</span> Mata uang virtual yang digunakan untuk mengakses fitur Layanan</li>
                            <li><span className="font-medium text-neutral-900">"Konten":</span> Skrip, teks, audio, gambar, atau materi lain yang dihasilkan melalui Layanan</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">3. Layanan yang Disediakan</h2>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-3">
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">Yang Kami Sediakan:</h3>
                            <ul className="space-y-1.5 text-neutral-600 text-sm">
                                <li>• Generator skrip video menggunakan teknologi Google Gemini AI</li>
                                <li>• Text-to-Speech (TTS) untuk narasi</li>
                                <li>• Pencarian gambar dan video stock</li>
                                <li>• Fitur editing dan penyimpanan skrip</li>
                            </ul>
                        </div>
                        <p className="text-xs text-neutral-500">
                            Layanan bersifat "as-is" dan "as-available". Kami tidak menjamin ketersediaan 100% tanpa gangguan.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">4. Pendaftaran dan Akun</h2>
                        <p className="text-neutral-600 mb-2">Untuk menggunakan Layanan:</p>
                        <ul className="space-y-1.5 text-neutral-600">
                            <li>• Anda harus berusia minimal <span className="font-medium text-neutral-900">18 tahun</span></li>
                            <li>• Informasi yang Anda berikan harus akurat dan terkini</li>
                            <li>• Anda bertanggung jawab menjaga kerahasiaan akun</li>
                        </ul>
                    </section>

                    {/* Section 5 - Highlight */}
                    <section className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">5. Sistem Kredit dan Pembayaran</h2>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">Model Pay-Per-Use</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white border border-neutral-200 rounded p-2">
                                    <span className="text-neutral-500">Script Generation</span>
                                    <p className="font-medium text-neutral-900">20-50 kredit</p>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded p-2">
                                    <span className="text-neutral-500">Text-to-Speech</span>
                                    <p className="font-medium text-neutral-900">30 kredit</p>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded p-2">
                                    <span className="text-neutral-500">Image Search</span>
                                    <p className="font-medium text-neutral-900">10 kredit</p>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded p-2">
                                    <span className="text-neutral-500">Video Search</span>
                                    <p className="font-medium text-neutral-900">20 kredit</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-neutral-600">
                            <p>• Kredit gratis: <strong className="text-neutral-900">60 kredit</strong> untuk pengguna baru</p>
                            <p>• Masa berlaku: <strong className="text-neutral-900">Tidak ada kadaluarsa</strong></p>
                            <p>• Bonus pembelian pertama: <strong className="text-neutral-900">20%</strong></p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">6. Kebijakan Refund</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                            <p className="text-sm font-medium text-yellow-900 mb-1">Penting!</p>
                            <p className="text-sm text-yellow-800">
                                Semua pembelian kredit bersifat <strong>final</strong> dan <strong>non-refundable</strong>.
                            </p>
                        </div>
                        <p className="text-neutral-600 text-sm">
                            Refund hanya diberikan untuk kesalahan teknis, double charge, atau layanan sama sekali tidak dapat digunakan.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">7. Hak Kekayaan Intelektual</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-200 rounded-lg p-4">
                                <p className="text-xs text-neutral-500 mb-1">Konten Anda</p>
                                <p className="text-sm text-neutral-900 font-medium">Milik Anda 100%</p>
                                <p className="text-xs text-neutral-600 mt-1">Hak penuh untuk gunakan, modifikasi, distribusi</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-4">
                                <p className="text-xs text-neutral-500 mb-1">Platform ScriptAI</p>
                                <p className="text-sm text-neutral-900 font-medium">Milik Kami</p>
                                <p className="text-xs text-neutral-600 mt-1">Tidak boleh di-copy atau reverse engineer</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">8. Larangan Penggunaan</h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-red-900 mb-2">Anda DILARANG menggunakan Layanan untuk:</p>
                            <ul className="space-y-1 text-sm text-red-800">
                                <li>• Konten ilegal atau melanggar hukum Indonesia</li>
                                <li>• Konten SARA, pornografi, atau kekerasan</li>
                                <li>• Spam, phishing, atau penipuan</li>
                                <li>• Melanggar hak cipta pihak lain</li>
                            </ul>
                            <p className="text-xs text-red-700 mt-2 font-medium">
                                Konsekuensi: Akun diblokir permanen tanpa refund
                            </p>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">9. Batasan Tanggung Jawab</h2>
                        <p className="text-neutral-600 text-sm mb-2">ScriptAI TIDAK BERTANGGUNG JAWAB atas:</p>
                        <ul className="space-y-1 text-neutral-600 text-sm">
                            <li>• Kerugian finansial akibat penggunaan konten yang dihasilkan</li>
                            <li>• Akurasi atau kelengkapan konten AI</li>
                            <li>• Gangguan layanan atau kehilangan data</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">10. Hukum yang Berlaku</h2>
                        <p className="text-neutral-600 text-sm">
                            Syarat dan Ketentuan ini diatur oleh <strong className="text-neutral-900">hukum Negara Republik Indonesia</strong>.
                            Sengketa diselesaikan di Pengadilan Negeri Jakarta Selatan.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-neutral-200 pt-6">
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">Kontak</h2>
                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                            <div>
                                <p className="text-neutral-500 text-xs">Email</p>
                                <a href="mailto:support@scriptai.id" className="text-neutral-900 hover:underline">support@scriptai.id</a>
                            </div>
                            <div>
                                <p className="text-neutral-500 text-xs">Website</p>
                                <a href="https://script-generator-ai.vercel.app" className="text-neutral-900 hover:underline">script-generator-ai.vercel.app</a>
                            </div>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="border-t border-neutral-200 pt-6">
                        <p className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                            <strong className="text-neutral-900">Dengan menggunakan ScriptAI</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui semua Syarat dan Ketentuan di atas.
                        </p>
                        <p className="text-xs text-neutral-400 mt-3 text-center">Berlaku efektif sejak 24 Desember 2024</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
