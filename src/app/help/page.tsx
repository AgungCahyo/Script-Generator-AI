'use client'

import Link from 'next/link'
import { ArrowBack, CheckmarkCircleOutline, PricetagsOutline, DocumentTextOutline, MicOutline, ImagesOutline, HelpCircleOutline } from 'react-ionicons'

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Back to home"
                        >
                            <ArrowBack color="currentColor" width="20px" height="20px" />
                        </Link>
                        <h1 className="text-xl font-bold text-neutral-900">Panduan Pengguna</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
                {/* Intro */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">ScriptAI</h2>
                    <p className="text-neutral-600">
                        Platform AI untuk membuat script video profesional dengan narasi dan media dalam hitungan menit
                    </p>
                </div>

                {/* Cara Memulai */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Cara Memulai</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-2">1. Registrasi Akun</h3>
                            <ul className="space-y-1 text-sm text-neutral-700 ml-4">
                                <li>• Klik "Sign In" di header</li>
                                <li>• Pilih daftar dengan Google atau Email</li>
                                <li>• Verifikasi email kalau pakai email/password</li>
                                <li>• Langsung dapat 60 credits gratis</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-2">2. Beli Credits (Opsional)</h3>
                            <ul className="space-y-1 text-sm text-neutral-700 ml-4">
                                <li>• Klik icon koin di header untuk cek saldo</li>
                                <li>• Pilih paket sesuai kebutuhan</li>
                                <li>• Bayar via Midtrans (Transfer Bank, E-wallet, Kartu Kredit)</li>
                                <li>• Credits langsung masuk setelah pembayaran berhasil</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-2">3. Generate Script</h3>
                            <ul className="space-y-1 text-sm text-neutral-700 ml-4">
                                <li>• Klik "Buat Script Baru"</li>
                                <li>• Masukkan topik video (contoh: "Tutorial Masak Rendang")</li>
                                <li>• Pilih durasi: 30 detik, 1 menit, atau 2 menit</li>
                                <li>• Klik "Generate" dan tunggu ~10-15 detik</li>
                                <li>• Script akan muncul dengan efek typing</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Fitur Utama */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Fitur Utama</h2>

                    <div className="space-y-6">
                        {/* Script Generation */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <DocumentTextOutline color="#171717" width="18px" height="18px" />
                                <h3 className="text-sm font-semibold text-neutral-900">Script Generation</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">Buat script video dengan AI dalam bahasa Indonesia yang natural.</p>

                            <div className="bg-neutral-50 rounded-lg p-4 mb-3">
                                <p className="text-xs font-semibold text-neutral-800 mb-2">Cara Pakai:</p>
                                <ol className="space-y-1 text-xs text-neutral-700 ml-4">
                                    <li>1. Masukkan topik (semakin spesifik semakin bagus)</li>
                                    <li>2. Pilih durasi video</li>
                                    <li>3. Generate</li>
                                    <li>4. Edit manual kalau perlu</li>
                                </ol>
                            </div>

                            <div className="bg-neutral-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-neutral-800 mb-2">Biaya:</p>
                                <div className="space-y-1 text-xs text-neutral-700">
                                    <div>• <strong>Hemat:</strong> 20 credits (Flash-Lite)</div>
                                    <div>• <strong>Standar:</strong> 30 credits (Flash) - Recommended</div>
                                    <div>• <strong>Premium:</strong> 50 credits (Pro)</div>
                                    <div className="text-neutral-500 mt-1">+ 10 credits per menit durasi</div>
                                </div>
                            </div>
                        </div>

                        {/* TTS */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MicOutline color="#171717" width="18px" height="18px" />
                                <h3 className="text-sm font-semibold text-neutral-900">Text-to-Speech (TTS)</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">Convert narasi jadi audio dengan suara natural dari OpenAI.</p>

                            <div className="bg-neutral-50 rounded-lg p-4 mb-3">
                                <p className="text-xs font-semibold text-neutral-800 mb-2">Pilihan Voice:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                                    <div>• <strong>Alloy</strong> - Natural, netral</div>
                                    <div>• <strong>Echo</strong> - Friendly, hangat</div>
                                    <div>• <strong>Fable</strong> - Tegas, authoritative</div>
                                    <div>• <strong>Onyx</strong> - Deep, masculine</div>
                                    <div>• <strong>Nova</strong> - Feminine, bright</div>
                                    <div>• <strong>Shimmer</strong> - Soft, feminine</div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-neutral-800">Biaya: <span className="font-normal">30 credits per section audio</span></p>
                            </div>
                        </div>

                        {/* Media Search */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ImagesOutline color="#171717" width="18px" height="18px" />
                                <h3 className="text-sm font-semibold text-neutral-900">Media Search</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">Cari gambar dan video stock gratis dari Pexels dan Pixabay.</p>

                            <div className="bg-neutral-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-neutral-800 mb-2">Biaya:</p>
                                <div className="space-y-1 text-xs text-neutral-700">
                                    <div>• <strong>Images:</strong> 10 credits per 5 gambar</div>
                                    <div>• <strong>Videos:</strong> 20 credits per video</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <PricetagsOutline color="#171717" width="18px" height="18px" />
                        <h2 className="text-lg font-semibold text-neutral-900">Paket Credits</h2>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <div className="text-sm font-semibold text-neutral-900">Starter</div>
                                <div className="text-xs text-neutral-600">100 credits + 20 bonus (first purchase)</div>
                            </div>
                            <div className="text-sm font-bold text-neutral-900">Rp 25K</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                                <div className="text-sm font-semibold text-blue-900">Popular</div>
                                <div className="text-xs text-blue-700">500 credits + 100 bonus (first purchase)</div>
                            </div>
                            <div className="text-sm font-bold text-blue-900">Rp 125K</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <div className="text-sm font-semibold text-neutral-900">Pro</div>
                                <div className="text-xs text-neutral-600">1,000 credits + 200 bonus (first purchase)</div>
                            </div>
                            <div className="text-sm font-bold text-neutral-900">Rp 250K</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <div className="text-sm font-semibold text-neutral-900">Agency</div>
                                <div className="text-xs text-neutral-600">2,500 credits + 500 bonus (first purchase)</div>
                            </div>
                            <div className="text-sm font-bold text-neutral-900">Rp 500K</div>
                        </div>
                    </div>

                    <Link
                        href="/pricing"
                        className="block w-full py-2.5 text-center text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Lihat Detail Pricing
                    </Link>
                </div>

                {/* Biaya Per Fitur */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Biaya Per Fitur</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left py-2 font-semibold text-neutral-900">Fitur</th>
                                    <th className="text-right py-2 font-semibold text-neutral-900">Biaya</th>
                                </tr>
                            </thead>
                            <tbody className="text-neutral-700">
                                <tr className="border-b border-neutral-100">
                                    <td className="py-2 text-xs">Generate Script (Hemat)</td>
                                    <td className="text-right text-xs">20 credits + 10/menit</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-2 text-xs">Generate Script (Standar)</td>
                                    <td className="text-right text-xs">30 credits + 10/menit</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-2 text-xs">Generate Script (Premium)</td>
                                    <td className="text-right text-xs">50 credits + 10/menit</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-2 text-xs">TTS per Section</td>
                                    <td className="text-right text-xs">30 credits</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-2 text-xs">Search Images (5 pcs)</td>
                                    <td className="text-right text-xs">10 credits</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-xs">Search Video</td>
                                    <td className="text-right text-xs">20 credits</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <HelpCircleOutline color="#171717" width="18px" height="18px" />
                        <h2 className="text-lg font-semibold text-neutral-900">FAQ</h2>
                    </div>

                    <div className="space-y-3">
                        <details className="group">
                            <summary className="text-sm font-medium text-neutral-900 cursor-pointer list-none flex items-center justify-between py-2 hover:text-neutral-700">
                                <span>Berapa lama generate script?</span>
                                <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-sm text-neutral-600 mt-1 pb-2">10-15 detik untuk script pendek, 20-30 detik untuk script panjang.</p>
                        </details>
                        <div className="border-t border-neutral-100"></div>

                        <details className="group">
                            <summary className="text-sm font-medium text-neutral-900 cursor-pointer list-none flex items-center justify-between py-2 hover:text-neutral-700">
                                <span>Audio bisa didownload?</span>
                                <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-sm text-neutral-600 mt-1 pb-2">Bisa, klik download di audio player setelah generate.</p>
                        </details>
                        <div className="border-t border-neutral-100"></div>

                        <details className="group">
                            <summary className="text-sm font-medium text-neutral-900 cursor-pointer list-none flex items-center justify-between py-2 hover:text-neutral-700">
                                <span>Media stock ada copyright?</span>
                                <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-sm text-neutral-600 mt-1 pb-2">Semua dari Pexels & Pixabay yang license-free untuk komersial.</p>
                        </details>
                        <div className="border-t border-neutral-100"></div>

                        <details className="group">
                            <summary className="text-sm font-medium text-neutral-900 cursor-pointer list-none flex items-center justify-between py-2 hover:text-neutral-700">
                                <span>Credits expired?</span>
                                <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-sm text-neutral-600 mt-1 pb-2">Tidak, credits tidak pernah expired.</p>
                        </details>
                        <div className="border-t border-neutral-100"></div>

                        <details className="group">
                            <summary className="text-sm font-medium text-neutral-900 cursor-pointer list-none flex items-center justify-between py-2 hover:text-neutral-700">
                                <span>Limit generate per hari?</span>
                                <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-sm text-neutral-600 mt-1 pb-2">Tidak ada limit, selama credits cukup.</p>
                        </details>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-neutral-900 text-white rounded-xl p-6 text-center">
                    <h2 className="text-lg font-bold mb-2">Butuh Bantuan?</h2>
                    <p className="text-sm text-neutral-300 mb-4">
                        Hubungi kami untuk support atau pertanyaan lebih lanjut
                    </p>
                    <a
                        href="mailto:agungcahyop29@gmail.com"
                        className="inline-block bg-white text-neutral-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                        Kontak Support
                    </a>
                </div>
            </div>
        </div>
    )
}
