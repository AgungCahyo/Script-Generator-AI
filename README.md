# ScriptAI - AI Video Script Generator

Platform berbasis AI untuk menghasilkan script video dengan narasi profesional dan media pendukung.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **AI**: Google Gemini, OpenAI GPT-4
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payment**: Midtrans
- **Automation**: n8n workflows
- **Deployment**: Vercel

## Core Features

### 1. AI Script Generation
- Real-time streaming generation dengan Gemini AI
- Support multiple models (Gemini Flash, GPT-4)
- Customizable tone, format, dan target audience
- Multi-language support

### 2. Text-to-Speech (TTS)
- OpenAI TTS dengan 6 voice options
- Per-section audio generation
- Audio preview before generation
- Firebase Storage integration

### 3. Media Search
- Stock images dari Pexels & Pixabay
- Stock videos dari Pexels & Pixabay
- Automatic upload ke Firebase Storage
- Metadata preservation

### 4. Credit System
- Pay-per-use model
- Midtrans payment integration
- Real-time balance updates
- Transaction history

## Security Implementation

### Payment Security
- Midtrans signature verification (SHA512)
- IP whitelist untuk callback
- Idempotency check untuk duplicate prevention
- Test notification handling

### API Security
- Rate limiting (in-memory)
  - Script generation: 5/min per user
  - Image search: 10/min per user
  - Video search: 10/min per user
  - TTS: 20/min per user
- Webhook signature verification
- Authorization checks untuk resource access
- Conditional logging (dev only)

### Firebase Security
- Storage rules untuk authenticated/service account access
- Token verification dengan error handling
- Secure credential management

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# AI APIs
GEMINI_API_KEY=
OPENAI_API_KEY=

# Midtrans (Public)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=

# Midtrans (Server-only)
MIDTRANS_SERVER_KEY=

# n8n Webhooks
N8N_WEBHOOK_URL=
N8N_TTS_WEBHOOK_URL=
IMAGE_SEARCH_WEBHOOK_URL=
VIDEO_SEARCH_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# App Config
NEXT_PUBLIC_APP_URL=
```

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 3. Firebase Setup
- Create Firebase project
- Enable Authentication (Email/Password)
- Enable Storage
- Download service account key
- Deploy storage rules

### 4. n8n Setup
- Deploy workflows dari `/autoscript` directory
- Configure webhook URLs
- Set `N8N_WEBHOOK_SECRET` environment variable

### 5. Run Development Server
```bash
npm run dev
```

## Production Deployment

### Vercel Deployment
```bash
vercel --prod
```

### Required Vercel Environment Variables
- All variables dari `.env.example`
- Set `N8N_WEBHOOK_SECRET` (same as n8n)
- Set `MIDTRANS_SERVER_KEY` (production key)

### Firebase Storage Rules
Deploy rules ke Firebase Console:
```bash
firebase deploy --only storage
```

## API Routes

### Public Routes
- `POST /api/scripts/generate` - Generate script (authenticated)
- `POST /api/images/search` - Search images (authenticated)
- `POST /api/videos/search` - Search videos (authenticated)
- `POST /api/scripts/[id]/generate-section-audio` - Generate TTS (authenticated)

### Webhook Routes (n8n only)
- `POST /api/scripts/callback` - Script/TTS callback
- `POST /api/images/callback` - Image search callback
- `POST /api/videos/callback` - Video search callback

### Payment Routes
- `POST /api/billing/create-checkout` - Create payment (authenticated)
- `POST /api/billing/callback` - Midtrans notification (IP whitelisted)

## Credit Costs

| Action | Cost |
|--------|------|
| Script Generation (Gemini Flash) | 1 credit |
| Script Generation (GPT-4) | 3 credits |
| Image Search (5 images) | 1 credit |
| Video Search (per video) | 2 credits |
| TTS Generation (per section) | 1 credit |

## n8n Workflows

### Required Workflows
1. `node-tts-webhook-firebase.json` - TTS generation & Firebase upload
2. `node-image-search-firebase.json` - Image search & Firebase upload
3. `node-video-search-firebase.json` - Video search & Firebase upload

### Webhook Security
All n8n workflows harus send `x-webhook-signature` header:
```javascript
// Add before HTTP Request node
const secret = process.env.N8N_WEBHOOK_SECRET;
return [{
  json: {
    ...$input.first().json,
    _authToken: secret
  }
}];
```

HTTP Request header:
```
x-webhook-signature: {{$json._authToken}}
```

## Testing

### Test Payment Flow
1. Use Midtrans test credentials
2. Send test notification dari Midtrans Dashboard
3. Check Vercel logs untuk verification

### Test TTS Generation
1. Generate script
2. Click "Generate Audio" per section
3. Check Firebase Storage untuk audio files

### Test Media Search
1. Generate script (untuk dapat keywords)
2. Open media toolbar
3. Search images/videos
4. Check Firebase Storage

## Troubleshooting

### Payment Callback Errors
- Check `MIDTRANS_SERVER_KEY` di Vercel
- Verify notification URL di Midtrans Dashboard
- Check Vercel logs untuk signature errors

### n8n Callback Errors (403)
- Verify `N8N_WEBHOOK_SECRET` sama di n8n dan Next.js
- Check n8n workflow send header `x-webhook-signature`
- Check Vercel logs

### Firebase Upload Errors (403)
- Deploy latest storage rules
- Verify service account permissions
- Check Google Cloud IAM roles

## License

Private project.
