# AutoScript - AI Script Generator

Tool untuk bikin script video otomatis pakai AI. Tinggal input topik, langsung jadi script siap pakai lengkap dengan audio narasi.

**Live**: [script-generator-ai.vercel.app](https://script-generator-ai.vercel.app)

## Fitur Utama

- Generate script video panjang (30-120 detik) otomatis
- Text-to-speech buat narasi (OpenAI TTS)
- Search gambar dan video dari Pexels/Pixabay
- Edit script per section dengan character limit
- History semua script yang udah dibuat
- Login pakai Google atau email

## Cara Pakai

1. Login pakai Google atau bikin akun
2. Beli credit di halaman Pricing (mulai dari Rp 20K)
3. Input topik video yang mau dibuat
4. Script langsung ke-generate dan bisa langsung di-edit
5. Generate audio TTS per section kalau mau
6. Search gambar/video yang cocok
7. Done! Script siap dipake untuk bikin video

## Kredit System

Harga flat **Rp 2.000 per credit**:
- Generate script: 50 credits
- TTS per section: 3 credits
- Search media: 2 credits

Paket tersedia: 10, 50, 100, 500 credits

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- React Ionicons

**Backend**
- PostgreSQL + Prisma
- Firebase Auth
- Google Gemini AI
- OpenAI TTS
- n8n automation

**Deployment**
- Vercel (frontend)
- Railway (database)

## Setup Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (admin)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# APIs
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=

# n8n Webhooks
N8N_WEBHOOK_URL=
N8N_TTS_WEBHOOK_URL=
N8N_PAYMENT_WEBHOOK_URL=

# Midtrans Payment
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

## Database Schema

**User**
- Credits balance
- Purchase history
- Scripts

**Script**
- Topic & generated script
- Audio files (per section)
- Media gallery (images/videos)
- Status (pending/processing/completed/failed)

**CreditTransaction**
- Transaction history
- Type (PURCHASE/USAGE/BONUS/REFUND)

## API Endpoints

**Scripts**
- `POST /api/scripts/generate` - Generate script
- `GET /api/scripts` - Get user history
- `PATCH /api/scripts/[id]` - Update script
- `POST /api/scripts/[id]/generate-section-audio` - TTS generation

**Credits**
- `GET /api/credits/balance` - Get balance
- `GET /api/credits/history` - Transaction history

**Billing**
- `POST /api/billing/create-checkout` - Create payment
- `POST /api/billing/callback` - Payment callback

**Media**
- `POST /api/images/search` - Search images (Pexels/Pixabay)
- `POST /api/videos/search` - Search videos (Pexels/Pixabay)
- `POST /api/media/delete` - Delete from gallery

## Deployment

Production di-deploy otomatis ke Vercel:

```bash
vercel --prod
```

Jangan lupa set semua environment variables di Vercel dashboard.

## Credit Costs

Operational cost per fitur:
- **Script generation**: ~Rp 500 (Gemini API)
- **TTS (1000 chars)**: ~Rp 235 (OpenAI TTS)
- **Media search**: Rp 100 (Firebase storage)

Dengan pricing Rp 2K/credit, margin profit 90-98%.

## Support

Hubungin maintainer kalau ada masalah.

---

Built with Next.js + Gemini AI + OpenAI TTS
