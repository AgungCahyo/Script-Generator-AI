# 🎬 AutoScript Generator

Web application for generating creative scripts using Google's latest Gemini AI models with real-time streaming, Firebase authentication, and automated audio generation.

**Live Demo**: [https://web-trigger.vercel.app](https://web-trigger.vercel.app)

## ✨ Features

- 🤖 **Latest AI Models** - Support for Google's newest Gemini models (3 Pro, 3 Flash, 2.5 Pro, 2.5 Flash, and more)
- ⚡ **Real-time Streaming** - Stream AI responses in real-time for better user experience
- 🔐 **Firebase Authentication** - Secure Google OAuth and Email/Password authentication
- 📝 **Script History** - View and manage all your generated scripts
- 🎙️ **Audio Generation** - Automatic text-to-speech conversion via n8n webhooks
- 🎨 **Modern UI** - Clean, responsive interface with dark mode support
- 🔄 **Auto-save** - Scripts automatically saved to database
- 👤 **User Isolation** - Each user's data is completely isolated

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API (@google/generative-ai)
- **Authentication**: Firebase Auth (Client + Admin SDK)
- **Database**: PostgreSQL with Prisma ORM
- **Automation**: n8n webhooks for audio generation
- **Deployment**: Vercel
- **UI Components**: React Ionicons

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Firebase project
- Google Gemini API key
- n8n instance (optional, for audio generation)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd web-trigger
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# n8n Webhooks (optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
N8N_TTS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/tts/...

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Project Structure

```
web-trigger/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   └── scripts/      # Script generation endpoints
│   │   ├── auth/             # Authentication pages
│   │   └── page.tsx          # Main page
│   ├── components/           # React components
│   │   ├── ScriptForm.tsx    # Main form component
│   │   ├── ScriptResult.tsx  # Result display
│   │   ├── HistoryList.tsx   # Script history
│   │   ├── LoginForm.tsx     # Authentication UI
│   │   └── CustomDropdown.tsx # Model selector
│   ├── lib/
│   │   ├── api/              # API utilities
│   │   ├── constants/        # Model definitions & constants
│   │   ├── prompts/          # AI prompt templates & builders
│   │   ├── types/            # TypeScript types
│   │   └── firebase/         # Firebase configuration
│   └── styles/               # Global styles
└── public/                   # Static assets
```

## 🎨 Available AI Models

The application supports the latest Google Gemini models:

### Gemini 3 Series (Preview)
- **Gemini 3 Pro** - Most powerful for reasoning & agentic workflows
- **Gemini 3 Flash** (Default) - Fastest & most intelligent with superior search

### Gemini 2.5 Series (Stable)
- **Gemini 2.5 Pro** - State-of-the-art thinking model for complex problems
- **Gemini 2.5 Flash** - Best price-performance ratio
- **Gemini 2.5 Flash-Lite** - Optimized for cost-efficiency & high throughput

### Gemini 1.5 Series (Legacy)
- **Gemini 1.5 Pro** - Stable model for various tasks
- **Gemini 1.5 Flash** - Stable & fast for general tasks

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
```

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to production:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Environment Variables

Make sure to set all required environment variables in your Vercel project settings.

## 📝 API Endpoints

- `POST /api/scripts/generate` - Generate script with streaming
- `GET /api/scripts` - Get user's script history
- `GET /api/scripts/[id]` - Get specific script
- `POST /api/scripts/[id]/generate-audio` - Generate audio for script
- `POST /api/scripts/trigger` - Trigger n8n webhook

## 🔒 Authentication

The app uses Firebase Authentication with support for:
- Google OAuth
- Email/Password

All API routes are protected and require authentication. Guest mode is available with limited functionality.

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL. Main models:

- **Script** - Stores generated scripts with metadata
- **User** - User profiles and preferences

See `prisma/schema.prisma` for the complete schema.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, please contact the project maintainer.

---

**Built with ❤️ using Next.js and Google Gemini AI**
