import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/Confirm";
import "./globals.css";

const APP_NAME = "ScriptAI - Generator Skrip Video AI"
const APP_DESCRIPTION = "Generate skrip video profesional dengan AI Gemini 3.0. Pay-per-use, tanpa subscription. Cocok untuk YouTube, TikTok, Instagram. Platform Indonesia pertama dengan Gemini AI."
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://script-generator-ai.vercel.app"

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION,
  applicationName: "ScriptAI",

  // Keywords for SEO (Indonesian focus)
  keywords: [
    "generator skrip video AI",
    "pembuat naskah YouTube otomatis",
    "AI script generator Indonesia",
    "tools AI untuk kreator konten",
    "generator script TikTok",
    "Gemini AI Indonesia",
    "pembuat konten video AI",
    "automated content writing",
  ],

  // Authors and creator
  authors: [{ name: "ScriptAI" }],
  creator: "ScriptAI",
  publisher: "ScriptAI",

  // Manifest for PWA
  manifest: "/manifest.json",

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph tags for social media
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US"],
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "ScriptAI - Generator Skrip Video dengan AI Gemini",
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
    creator: "@scriptai", // Update with actual Twitter handle
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add when you have Google Search Console, etc.)
   verification: {
     google: "google967da2be94ce6a8e.html",
   },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#171717" />
        <link rel="canonical" href={APP_URL} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <AudioProvider>
            <ToastProvider>
              <ConfirmProvider>
                {children}
              </ConfirmProvider>
            </ToastProvider>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
