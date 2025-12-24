'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowBack, CheckmarkCircleOutline, PlayCircleOutline, ImagesOutline, VolumeHighOutline, DocumentTextOutline } from 'react-ionicons'
import Footer from '@/components/Footer'
import AudioPlayer from '@/components/AudioPlayer'

// Demo showcase examples with real script structure
const SHOWCASE_EXAMPLES = [
    {
        id: 1,
        title: 'Tutorial Memasak Nasi Goreng',
        platform: 'YouTube Shorts',
        duration: '30 detik',
        category: 'Tutorial',
        tone: 'Casual & Friendly',
        description: 'Script tutorial memasak yang engaging dengan hook menarik dan step-by-step yang jelas',
        sections: [
            {
                index: 0,
                timestamp: '00:00-00:03',
                visual: 'Close-up nasi goreng yang lembek dan kering',
                narasi: 'Pernah nggak sih bikin nasi goreng malah jadi nasi kering?'
            },
            {
                index: 1,
                timestamp: '00:03-00:08',
                visual: 'Host di dapur dengan wajan dan bahan-bahan',
                narasi: 'Hai sobat dapur! Hari ini aku bakal share trik bikin nasi goreng yang PERFECT, dijamin nggak gagal!'
            },
            {
                index: 2,
                timestamp: '00:08-00:26',
                visual: 'Step by step memasak: nasi dingin, api besar, tumis bumbu, tambah kecap',
                narasi: 'Pertama, pastikan nasinya dingin ya. Nasi panas = nasi lembek. Kedua, panaskan wajan dengan api besar. Ini kunci! Ketiga, tumis bumbu dulu baru masukkan nasi. Jangan kebalik! Terakhir, tambahkan kecap manis dan aduk cepat. Done!'
            },
            {
                index: 3,
                timestamp: '00:26-00:30',
                visual: 'Hasil nasi goreng perfect di piring, host thumbs up',
                narasi: 'Gampang kan? Cobain sekarang dan tag aku di Instagram! Jangan lupa like dan subscribe untuk resep lainnya!'
            }
        ],
        audioFiles: [
            { timestamp: '00:00-00:03', audioUrl: '/demo-audio/tutorial-cooking-hook.mp3', voiceId: 'nova' },
            { timestamp: '00:03-00:08', audioUrl: '/demo-audio/tutorial-cooking-intro.mp3', voiceId: 'nova' }
        ],
        sampleImages: [
            '/demo-media/tutorial-cooking/tutorial-cooking-1.jpg',
            '/demo-media/tutorial-cooking/tutorial-cooking-2.jpg'
        ],
        sampleVideos: [
            {
                thumbnail: '/demo-media/tutorial-cooking/tutorial-cooking-video-thumb.jpg',
                url: '/demo-media/tutorial-cooking/tutorial-cooking-demo.mp4'
            }
        ]
    },
    {
        id: 2,
        title: 'Review Smartphone Terbaru',
        platform: 'TikTok',
        duration: '60 detik',
        category: 'Review',
        tone: 'Profesional & Informatif',
        description: 'Review produk yang objektif dengan detail spesifikasi dan verdict honest',
        sections: [
            {
                index: 0,
                timestamp: '00:00-00:05',
                visual: 'Smartphone di tangan, kamera close-up 200MP',
                narasi: 'HP 3 jutaan dengan kamera 200MP? Worth it nggak sih?'
            },
            {
                index: 1,
                timestamp: '00:05-00:13',
                visual: 'Host dengan smartphone, background setup review',
                narasi: 'Halo tech lovers! Setelah 2 minggu testing smartphone ini, akhirnya aku bisa kasih verdict jujur. Simak sampai habis!'
            },
            {
                index: 2,
                timestamp: '00:13-00:53',
                visual: 'B-roll: Design, gaming, kamera samples, charging',
                narasi: 'Dari segi design, premium banget. Material metal, layar AMOLED 120Hz yang buttery smooth. Performa? Chipset flagship-nya handle game berat tanpa lag. Multitasking? Gas poll! Nah yang paling wow, kameranya. 200MP memang bukan gimmick. Detail foto bahkan di zoom 10x tetap tajam. Night mode-nya juga juara. Baterai 5000mAh tahan seharian pemakaian berat. Fast charging 67W, 0-100% cuma 40 menit. Minus? Speaker mono dan nggak ada headphone jack. Tapi overall...'
            },
            {
                index: 3,
                timestamp: '00:53-01:00',
                visual: 'Host with verdict, link overlay',
                narasi: '...untuk harga segini, WORTH IT banget! Link pembelian ada di bio. Follow untuk review gadget lainnya!'
            }
        ],
        audioFiles: [
            { timestamp: '00:00-00:05', audioUrl: '/demo-audio/review-smartphone-hook.mp3', voiceId: 'nova' }
        ],
        sampleImages: [
            '/demo-media/review-smartphone/review-smartphone-1.jpg',
            '/demo-media/review-smartphone/review-smartphone-2.jpg'
        ],
        sampleVideos: [
            {
                thumbnail: '/demo-media/review-smartphone/review-smartphone-video-thumb.jpg',
                url: '/demo-media/review-smartphone/review-smartphone-demo.mp4'
            }
        ]
    },
    {
        id: 3,
        title: 'Motivasi Pagi untuk Produktivitas',
        platform: 'Instagram Reels',
        duration: '45 detik',
        category: 'Motivasi',
        tone: 'Inspiratif & Energik',
        description: 'Motivational content yang powerful untuk morning boost productivity',
        sections: [
            {
                index: 0,
                timestamp: '00:00-00:04',
                visual: 'Person di kasur nyaman tapi terlihat stuck',
                narasi: 'Kenapa lo masih stuck di zona nyaman?'
            },
            {
                index: 1,
                timestamp: '00:04-00:10',
                visual: 'Morning view, sunrise, energetic vibes',
                narasi: 'Good morning achievers! Hari ini aku mau remind satu hal penting yang sering kita lupakan...'
            },
            {
                index: 2,
                timestamp: '00:10-00:40',
                visual: 'Montage: workout, working, studying, achieving goals',
                narasi: 'Comfort zone itu seperti kasur empuk. Enak? IYA. Bikin lo berkembang? NGGAK. Setiap hari lo bangun, lo punya pilihan: tetap di situ atau MOVE FORWARD. Orang sukses bukan orang yang nggak takut. Mereka TAKUT tapi tetap ACTION. Fail? Biasa. Yang penting lo BELAJAR dan coba lagi. Inget, 1% progress setiap hari = 365% lebih baik dalam setahun. Stop waiting for perfect moment. The moment is NOW.'
            },
            {
                index: 3,
                timestamp: '00:40-00:45',
                visual: 'CTA screen with inspiring background',
                narasi: 'Tag teman yang butuh motivasi ini! Share dan follow untuk daily inspiration. You got this!'
            }
        ],
        audioFiles: [
            { timestamp: '00:00-00:04', audioUrl: '/demo-audio/motivasi-pagi-hook.mp3', voiceId: 'nova' }
        ],
        sampleImages: [
            '/demo-media/motivasi-pagi/motivasi-pagi-1.jpg',
            '/demo-media/motivasi-pagi/motivasi-pagi-2.jpg'
        ],
        sampleVideos: [
            {
                thumbnail: '/demo-media/motivasi-pagi/motivasi-pagi-video-thumb.jpg',
                url: '/demo-media/motivasi-pagi/motivasi-pagi-demo.mp4'
            }
        ]
    },
    {
        id: 4,
        title: 'Tips Hemat Bulanan untuk Gen Z',
        platform: 'YouTube Shorts',
        duration: '45 detik',
        category: 'Educational',
        tone: 'Friendly & Relatable',
        description: 'Financial literacy tips yang actionable untuk anak muda',
        sections: [
            {
                index: 0,
                timestamp: '00:00-00:04',
                visual: 'Empty wallet, calendar showing end of month',
                narasi: 'Gaji selalu habis sebelum tanggal tua? Fix, tonton ini!'
            },
            {
                index: 1,
                timestamp: '00:04-00:10',
                visual: 'Host dengan whiteboard/digital notes',
                narasi: 'Halo money smart people! Aku bakal share 3 tips hemat yang BENAR-BENAR work buat anak muda kayak kita.'
            },
            {
                index: 2,
                timestamp: '00:10-00:40',
                visual: 'Visual explanations untuk setiap tip dengan graphics',
                narasi: 'Tip #1: Rule 50-30-20. 50% untuk kebutuhan, 30% untuk keinginan, 20% untuk nabung. Simple tapi effective! Tip #2: Challenge "No Spend Weekend". Sebulan sekali, weekend tanpa belanja. Masak sendiri, ngumpul di rumah. Surprise, lo hemat ratusan ribu! Tip #3: Unsubscribe Unused Subscriptions. Netflix, Spotify, gym yang nggak dipake? Cut! Bisa saving 200-500k per bulan. Pro tip: Pake apps buat tracking pengeluaran. Awareness is the first step!'
            },
            {
                index: 3,
                timestamp: '00:40-00:45',
                visual: 'CTA with comment section prompt',
                narasi: 'Which tip bakal lo coba duluan? Comment di bawah! Subscribe untuk lebih banyak financial tips!'
            }
        ],
        audioFiles: [
            { timestamp: '00:00-00:04', audioUrl: '/demo-audio/tips-hemat-hook.mp3', voiceId: 'nova' }
        ],
        sampleImages: [
            '/demo-media/tips-hemat/tips-hemat-1.jpg',
            '/demo-media/tips-hemat/tips-hemat-2.jpg'
        ],
        sampleVideos: [
            {
                thumbnail: '/demo-media/tips-hemat/tips-hemat-video-thumb.jpg',
                url: '/demo-media/tips-hemat/tips-hemat-demo.mp4'
            }
        ]
    }
]

const CATEGORIES = ['Semua', 'Tutorial', 'Review', 'Motivasi', 'Educational']

export default function ShowcasePage() {
    const [selectedCategory, setSelectedCategory] = useState('Semua')
    const [selectedExample, setSelectedExample] = useState<number | null>(null)

    const filteredExamples = SHOWCASE_EXAMPLES.filter(example => {
        return selectedCategory === 'Semua' || example.category === selectedCategory
    })

    const currentExample = selectedExample !== null
        ? SHOWCASE_EXAMPLES.find(ex => ex.id === selectedExample)
        : null

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowBack color="currentColor" width="18px" height="18px" />
                        Kembali ke Home
                    </Link>
                </div>
            </header>

            {!currentExample ? (
                <>
                    {/* Hero Section */}
                    <div className="bg-white border-b border-neutral-200">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-neutral-900 mb-3">
                                    Showcase Script AI
                                </h1>
                                <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
                                    Lihat contoh script berkualitas yang di-generate oleh ScriptAI untuk berbagai platform dan use case
                                </p>

                                {/* Category Filter */}
                                <div className="flex items-center justify-center flex-wrap gap-2">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedCategory === category
                                                ? 'bg-neutral-900 text-white'
                                                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Examples Grid */}
                    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredExamples.map(example => (
                                <div
                                    key={example.id}
                                    onClick={() => setSelectedExample(example.id)}
                                    className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group"
                                >
                                    {/* Image Preview */}
                                    <div className="relative h-48 bg-neutral-100 overflow-hidden">
                                        <img
                                            src={example.sampleImages[0]}
                                            alt={example.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <PlayCircleOutline color="#ffffff" width="48px" height="48px" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                            {example.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                                            {example.description}
                                        </p>

                                        {/* Meta Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2.5 py-1 text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-700 rounded">
                                                {example.category}
                                            </span>
                                            <span className="px-2.5 py-1 text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-700 rounded">
                                                {example.platform}
                                            </span>
                                            <span className="px-2.5 py-1 text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-700 rounded">
                                                {example.duration}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredExamples.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-neutral-500">Tidak ada contoh untuk kategori ini</p>
                            </div>
                        )}
                    </main>

                    {/* CTA Section */}
                    <div className="bg-white border-t border-neutral-200">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                                    Siap Buat Script Sendiri?
                                </h2>
                                <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
                                    Generate script berkualitas tinggi seperti contoh di atas hanya dalam hitungan menit
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Link
                                        href="/"
                                        className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                                    >
                                        Mulai Generate
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="px-5 py-2.5 border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                                    >
                                        Lihat Pricing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // Detail View
                <main className="flex-1">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <button
                            onClick={() => setSelectedExample(null)}
                            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                        >
                            <ArrowBack color="currentColor" width="16px" height="16px" />
                            Kembali ke daftar
                        </button>

                        {/* Header Card */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                {currentExample.title}
                            </h2>
                            <p className="text-neutral-600 mb-4">{currentExample.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded">
                                    {currentExample.category}
                                </span>
                                <span className="px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded">
                                    {currentExample.platform}
                                </span>
                                <span className="px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded">
                                    {currentExample.duration}
                                </span>
                                <span className="px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded">
                                    {currentExample.tone}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Script Sections */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DocumentTextOutline color="#737373" width="20px" height="20px" />
                                    <h3 className="text-lg font-semibold text-neutral-900">Script Sections</h3>
                                </div>

                                {currentExample.sections.map((section, idx) => (
                                    <div key={idx} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                                        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                                            <span className="text-sm font-mono font-semibold text-neutral-900">
                                                {section.timestamp}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 mb-1">VISUAL:</p>
                                                <p className="text-sm text-neutral-700 leading-relaxed">
                                                    {section.visual}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 mb-1">NARASI:</p>
                                                <p className="text-sm text-neutral-700 leading-relaxed">
                                                    {section.narasi}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column - Audio & Media */}
                            <div className="space-y-6">
                                {/* Audio Preview */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <VolumeHighOutline color="#737373" width="20px" height="20px" />
                                        <h3 className="text-sm font-semibold text-neutral-900">Audio Preview</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {currentExample.audioFiles.map((audio, idx) => (
                                            <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-3">
                                                <p className="text-xs font-mono text-neutral-600 mb-2">{audio.timestamp}</p>
                                                <AudioPlayer src={audio.audioUrl} />
                                            </div>
                                        ))}
                                        <p className="text-xs text-neutral-500 px-1">
                                            Generated using OpenAI TTS (gpt-4o-mini-tts)
                                        </p>
                                    </div>
                                </div>

                                {/* Sample Media */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImagesOutline color="#737373" width="20px" height="20px" />
                                        <h3 className="text-sm font-semibold text-neutral-900">Sample Media</h3>
                                    </div>

                                    {/* Images */}
                                    <div className="mb-4">
                                        <p className="text-xs text-neutral-600 mb-2">Images:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentExample.sampleImages.map((img, idx) => (
                                                <div key={idx} className="border border-neutral-200 rounded-lg overflow-hidden">
                                                    <img
                                                        src={img}
                                                        alt={`Sample ${idx + 1}`}
                                                        className="w-full h-auto object-cover aspect-square hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Videos */}
                                    {currentExample.sampleVideos && currentExample.sampleVideos.length > 0 && (
                                        <div>
                                            <p className="text-xs text-neutral-600 mb-2">Videos:</p>
                                            <div className="space-y-2">
                                                {currentExample.sampleVideos.map((video, idx) => (
                                                    <div key={idx} className="border border-neutral-200 rounded-lg overflow-hidden">
                                                        <video
                                                            src={video.url}
                                                            poster={video.thumbnail}
                                                            controls
                                                            className="w-full h-auto"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-neutral-500 mt-3">
                                        Media from Pexels API
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            <Footer />
        </div>
    )
}
