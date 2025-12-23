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

// Narration Style Instructions
export const voiceToneInstructions: Record<string, string> = {
    'friendly': 'Voice Tone: Ramah dan hangat, seperti ngobrol santai dengan teman. Gunakan infleksi yang natural dan approachable.',
    'professional': 'Voice Tone: Profesional dan berwibawa, seperti expert yang kredibel. Maintain confidence tanpa terdengar arrogant.',
    'dramatic': 'Voice Tone: Dramatis dan penuh emosi, seperti storyteller yang passionate. Build tension dan suspense di momen yang tepat.',
    'calm': 'Voice Tone: Tenang dan menenangkan, seperti berbisik lembut. Hindari nada tinggi atau sudden changes yang bisa mengagetkan.',
    'energetic': 'Voice Tone: Energik dan antusias, seperti hype man yang passionate. Full of excitement tanpa terdengar berlebihan.',
    'educational': 'Voice Tone: Jelas dan patient, seperti guru yang baik. Gunakan pacing yang memudahkan pemahaman.'
}

export const pacingInstructions: Record<string, string> = {
    'very-slow': 'Pacing: SANGAT LAMBAT - Gunakan kalimat pendek (5-8 kata), banyak jeda. Cocok untuk ASMR/meditasi. Target: 80-100 kata per menit.',
    'slow': 'Pacing: LAMBAT - Kalimat sedang (8-12 kata), jeda natural antar poin. Cocok untuk topik kompleks atau storytelling dramatis. Target: 120-140 kata per menit.',
    'medium': 'Pacing: SEDANG - Kalimat normal (10-15 kata), flow natural. Standard untuk kebanyakan konten. Target: 150-170 kata per menit.',
    'fast': 'Pacing: CEPAT - Kalimat lebih pendek dan punchy (8-12 kata), minimal jeda. Cocok untuk entertainment. Target: 180-200 kata per menit.',
    'very-fast': 'Pacing: SANGAT CEPAT - Kalimat super pendek (5-8 kata), rapid fire delivery. Cocok untuk viral shorts. Target: 200-220 kata per menit.'
}

export const vocabularyInstructions: Record<string, string> = {
    'simple': 'Vocabulary: SEDERHANA - Gunakan kata-kata umum yang dipahami siapa saja. Hindari jargon atau istilah teknis. Seperti berbicara dengan anak SMP.',
    'conversational': 'Vocabulary: PERCAKAPAN - Bahasa sehari-hari yang natural. Boleh pakai istilah populer tapi tetap jelas. Seperti ngobrol dengan teman kuliah.',
    'professional': 'Vocabulary: PROFESIONAL - Gunakan business terminology yang appropriate. Formal tapi tetap accessible. Seperti presentasi di kantor.',
    'technical': 'Vocabulary: TEKNIS - Boleh gunakan jargon dan istilah spesifik untuk niche tertentu. Assume audience punya background knowledge. Seperti diskusi expert.'
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
   D. IMAGE KEYWORDS: **WAJIB** - Sertakan rekomendasi keyword untuk mencari gambar pendukung

3. PENTING:
   - LANGSUNG tulis naskah, tanpa pembuka/penutup tambahan
   - Setiap section HARUS punya [WAKTU], VISUAL:, dan NARASI:
   - NARASI tidak boleh ada label speaker, langsung teksnya
   - Sesuaikan panjang naskah dengan durasi yang diminta
   - ⚠️ **SANGAT PENTING**: Di akhir script setelah tanda "---", WAJIB sertakan section IMAGE KEYWORDS dalam format:
     ---
     IMAGE KEYWORDS:
     keyword1, keyword2, keyword3, ...

4. ⚠️ ATURAN KHUSUS UNTUK NARASI (WAJIB DIIKUTI):
   - NARASI HANYA berisi teks murni yang akan dibacakan oleh Text-to-Speech
   - DILARANG KERAS menambahkan bracket seperti [Chapter: ...] atau [Intro] di dalam NARASI
   - DILARANG menambahkan label struktural apapun di dalam NARASI
   - NARASI harus bersih dari markup, hanya kalimat yang natural untuk diucapkan
   - Jika perlu chapter/section marker, masukkan di VISUAL saja, BUKAN di NARASI
   
   ❌ CONTOH SALAH:
   NARASI: [Chapter: Kenapa Kita Takut?] Wajar banget kalau kita ngerasa takut...
   
   ✅ CONTOH BENAR:
   VISUAL: Teks chapter "Kenapa Kita Takut?" muncul di layar
   NARASI: Wajar banget kalau kita ngerasa takut pas ada teknologi baru...

CONTOH FORMAT LENGKAP:
[00:00]
VISUAL: Wajah ekspresif menatap kamera
NARASI: Pernah nggak sih lu kepikiran, kenapa ada orang yang karirnya melejit banget?

[00:15]
VISUAL: Teks highlight muncul dengan chapter marker
NARASI: Wajar banget kalau kita ngerasa takut pas ada teknologi baru kayak AI.

---
IMAGE KEYWORDS:
technology innovation, artificial intelligence concept, business success, productivity workspace, modern office, laptop working, data visualization, future technology

⚠️ INGAT: Section IMAGE KEYWORDS di atas adalah WAJIB dan HARUS ada di setiap script!
`
