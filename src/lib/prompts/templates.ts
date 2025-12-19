/**
 * Prompt templates and instruction mappings for script generation
 */

export const durationMap: Record<string, string> = {
    '30s': '30 detik (sekitar 80-100 kata)',
    '1m': '1 menit (sekitar 150-180 kata)',
    '3m': '3 menit (sekitar 450-500 kata)',
    '5m': '5 menit (sekitar 750-850 kata)',
    '10m': '10 menit (sekitar 1500 kata)'
}

export const platformInstructions: Record<string, string> = {
    'tiktok': 'Format untuk TikTok: Hook kuat di 3 detik pertama, pacing cepat, gunakan pattern interrupt, cocok untuk vertical video.',
    'youtube-shorts': 'Format untuk YouTube Shorts: Mirip TikTok tapi bisa sedikit lebih informatif, hook dalam 2 detik pertama.',
    'youtube': 'Format untuk YouTube: Bisa lebih detail dan mendalam, gunakan chapter markers, sertakan intro dan outro.',
    'podcast': 'Format untuk Podcast: Lebih conversational, bisa lebih panjang penjelasannya, tidak perlu visual description.',
    'instagram-reels': 'Format untuk Instagram Reels: Visual-heavy, caption friendly, trending audio friendly.'
}

export const toneInstructions: Record<string, string> = {
    'casual': 'Gaya bahasa: Santai, friendly, pakai "lu" dan "gue" atau "kamu" dan "aku".',
    'professional': 'Gaya bahasa: Profesional tapi tetap engaging, pakai "Anda" dan "saya", hindari slang.',
    'humor': 'Gaya bahasa: Lucu dan menghibur, sisipkan jokes atau wordplay, tapi tetap ada value.',
    'inspirational': 'Gaya bahasa: Inspiratif dan memotivasi, gunakan storytelling yang powerful.',
    'educational': 'Gaya bahasa: Edukatif dan informatif, jelaskan dengan analogi yang mudah dipahami.'
}

export const formatInstructions: Record<string, string> = {
    'monolog': 'Format: Monolog langsung ke kamera, satu speaker berbicara sepanjang video.',
    'storytelling': 'Format: Storytelling dengan alur yang jelas (setup, conflict, resolution).',
    'tutorial': 'Format: Tutorial step-by-step yang mudah diikuti, gunakan numbering.',
    'review': 'Format: Review dengan pros/cons, rating atau rekomendasi di akhir.',
    'tips': 'Format: Tips & tricks dengan poin-poin yang actionable dan mudah diingat.'
}

export const hookInstructions: Record<string, string> = {
    'question': 'Hook: Mulai dengan pertanyaan provokatif yang membuat penonton berpikir.',
    'fact': 'Hook: Mulai dengan fakta mengejutkan atau statistik yang shocking.',
    'story': 'Hook: Mulai dengan cerita personal atau anekdot yang relatable.',
    'problem': 'Hook: Mulai dengan menjelaskan problem yang dialami penonton.',
    'direct': 'Hook: Langsung ke poin utama tanpa basa-basi.'
}

export const languageInstructions: Record<string, string> = {
    'id-casual': 'Bahasa: Bahasa Indonesia santai, boleh campur dengan istilah gaul yang umum.',
    'id-formal': 'Bahasa: Bahasa Indonesia formal dan baku, hindari slang.',
    'en': 'Language: English, casual but professional tone.'
}

export const SCRIPT_FORMAT_TEMPLATE = `
ATURAN FORMAT OUTPUT:

1. Gunakan format berikut untuk SETIAP bagian:
   [WAKTU] contoh: [00:00]
   VISUAL: (deskripsi singkat apa yang tampil di layar)
   NARASI: (teks yang akan diucapkan - TANPA label speaker, langsung isi narasinya)

2. STRUKTUR:
   A. HOOK: Mulai dengan hook yang kuat sesuai gaya yang diminta
   B. CONTENT: Isi utama video
   C. CTA: Ajak audiens bertindak (subscribe, like, comment, dll)

3. PENTING:
   - LANGSUNG tulis naskah, tanpa pembuka/penutup tambahan
   - Setiap section HARUS punya [WAKTU], VISUAL:, dan NARASI:
   - NARASI tidak boleh ada label speaker, langsung teksnya
   - Sesuaikan panjang naskah dengan durasi yang diminta

CONTOH FORMAT:
[00:00]
VISUAL: Wajah ekspresif menatap kamera
NARASI: (hook sesuai gaya yang diminta)

[00:15]
VISUAL: Teks highlight muncul
NARASI: (lanjutan content)
`
