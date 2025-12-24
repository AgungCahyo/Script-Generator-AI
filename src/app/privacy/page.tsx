'use client'

import Link from 'next/link'
import { ArrowBack } from 'react-ionicons'

export default function PrivacyPage() {
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
                    <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Kebijakan Privasi</h1>
                    <p className="text-sm text-neutral-500">ScriptAI - Generator Skrip Video AI</p>
                    <p className="text-xs text-neutral-400 mt-1">Terakhir Diperbarui: 24 Desember 2024</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-sm leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">1. Pendahuluan</h2>
                        <p className="text-neutral-600">
                            ScriptAI ("kami", "kami punya", atau "Platform") berkomitmen untuk melindungi privasi Anda.
                            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
                            melindungi informasi pribadi Anda saat menggunakan layanan kami.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">2. Informasi yang Kami Kumpulkan</h2>

                        <div className="space-y-4">
                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-neutral-900 mb-2">A. Informasi Akun</h3>
                                <ul className="space-y-1 text-neutral-600 text-sm">
                                    <li>• Alamat email</li>
                                    <li>• Nama (opsional)</li>
                                    <li>• Password (ter-enkripsi melalui Firebase)</li>
                                </ul>
                            </div>

                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-neutral-900 mb-2">B. Informasi Pembayaran</h3>
                                <ul className="space-y-1 text-neutral-600 text-sm">
                                    <li>• Data transaksi (jumlah, tanggal, status)</li>
                                    <li className="text-green-700 font-medium">✓ TIDAK menyimpan informasi kartu kredit</li>
                                    <li>• Diproses aman melalui Midtrans (PCI-DSS compliant)</li>
                                </ul>
                            </div>

                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-neutral-900 mb-2">C. Konten yang Anda Buat</h3>
                                <ul className="space-y-1 text-neutral-600 text-sm">
                                    <li>• Skrip video yang dihasilkan</li>
                                    <li>• Audio hasil Text-to-Speech</li>
                                    <li>• Gambar dan video yang Anda simpan</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">3. Bagaimana Kami Menggunakan Informasi</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Menyediakan Layanan</p>
                                <p className="text-sm text-neutral-900">Membuat akun, generate skrip, menyimpan riwayat</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Meningkatkan Layanan</p>
                                <p className="text-sm text-neutral-900">Analisis penggunaan, debugging, optimasi</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Komunikasi</p>
                                <p className="text-sm text-neutral-900">Notifikasi transaksi, update fitur</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Keamanan</p>
                                <p className="text-sm text-neutral-900">Mencegah fraud, monitoring abuse</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 - Highlight */}
                    <section className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">4. Penyimpanan & Keamanan Data</h2>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Lokasi Penyimpanan</p>
                                <p className="text-sm text-neutral-600">Firebase Cloud Storage (Google Cloud - Asia region) & PostgreSQL</p>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded p-3">
                                <p className="text-xs text-neutral-500 mb-2">Keamanan</p>
                                <ul className="space-y-1 text-xs text-neutral-600">
                                    <li>✓ Enkripsi HTTPS/TLS</li>
                                    <li>✓ Firebase Authentication</li>
                                    <li>✓ Access Control ketat</li>
                                    <li>✓ Regular backup</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 - Table */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">5. Berbagi Data dengan Pihak Ketiga</h2>
                        <p className="text-xs text-neutral-500 mb-3">Kami hanya berbagi data untuk menyediakan layanan:</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border border-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-900">Pihak Ketiga</th>
                                        <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-900">Tujuan</th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-600">
                                    <tr>
                                        <td className="border border-neutral-200 px-3 py-2">Google Gemini AI</td>
                                        <td className="border border-neutral-200 px-3 py-2">Generate skrip dengan AI</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-neutral-200 px-3 py-2">Firebase (Google)</td>
                                        <td className="border border-neutral-200 px-3 py-2">Authentication & storage</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-neutral-200 px-3 py-2">Midtrans</td>
                                        <td className="border border-neutral-200 px-3 py-2">Payment processing</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                            <p className="text-sm font-medium text-green-900 mb-1">Kami TIDAK PERNAH:</p>
                            <ul className="space-y-1 text-sm text-green-800">
                                <li>✗ Menjual data pribadi Anda</li>
                                <li>✗ Membagikan untuk iklan pihak ketiga</li>
                                <li>✗ Memberikan akses tanpa izin</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">6. Hak Anda atas Data Pribadi</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-900 mb-1">Hak Akses</p>
                                <p className="text-xs text-neutral-600">Melihat & mendapat salinan data Anda</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-900 mb-1">Hak Perbaikan</p>
                                <p className="text-xs text-neutral-600">Mengubah informasi di Settings</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-900 mb-1">Hak Penghapusan</p>
                                <p className="text-xs text-neutral-600">Menghapus akun kapan saja</p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-900 mb-1">Hak Portabilitas</p>
                                <p className="text-xs text-neutral-600">Export skrip & file Anda</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">7. Cookies</h2>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-neutral-400">•</span>
                                <div>
                                    <p className="text-sm text-neutral-900 font-medium">Essential Cookies (Wajib)</p>
                                    <p className="text-xs text-neutral-600">Session cookies untuk login - tidak bisa dinonaktifkan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-neutral-400">•</span>
                                <div>
                                    <p className="text-sm text-neutral-900 font-medium">Analytics Cookies (Opsional)</p>
                                    <p className="text-xs text-neutral-600">Tracking penggunaan - bisa dinonaktifkan di browser</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">8. Keamanan Data Anak-Anak</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-900">
                                Platform ini <strong>TIDAK ditujukan</strong> untuk anak di bawah <strong>18 tahun</strong>.
                                Kami tidak secara sengaja mengumpulkan data anak di bawah 18 tahun.
                            </p>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">9. Kepatuhan Regulasi</h2>
                        <p className="text-neutral-600 text-sm">
                            Kami mematuhi <strong className="text-neutral-900">UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi</strong> Indonesia
                            dan menghormati hak-hak GDPR untuk user dari Uni Eropa.
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

                    {/* Summary Box */}
                    <section className="border border-blue-200 bg-blue-50 rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Ringkasan Kebijakan</h3>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="text-blue-700 font-medium mb-1">Kami mengumpulkan:</p>
                                <p className="text-blue-900">Email, data penggunaan, konten yang Anda buat</p>
                            </div>
                            <div>
                                <p className="text-blue-700 font-medium mb-1">Kami TIDAK:</p>
                                <p className="text-blue-900">Menjual data, share tanpa izin, simpan data kartu</p>
                            </div>
                            <div>
                                <p className="text-blue-700 font-medium mb-1">Anda bisa:</p>
                                <p className="text-blue-900">Akses, edit, hapus data kapan saja</p>
                            </div>
                            <div>
                                <p className="text-blue-700 font-medium mb-1">Keamanan:</p>
                                <p className="text-blue-900">Enkripsi HTTPS, Firebase Auth, backup regular</p>
                            </div>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="border-t border-neutral-200 pt-6">
                        <p className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                            <strong className="text-neutral-900">Dengan menggunakan ScriptAI</strong>, Anda menyatakan telah membaca dan memahami Kebijakan Privasi ini.
                        </p>
                        <p className="text-xs text-neutral-400 mt-3 text-center">Berlaku efektif sejak 24 Desember 2024</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
