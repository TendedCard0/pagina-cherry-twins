import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: 'Cherry Twins | Premium Streetwear',
    template: '%s | Cherry Twins',
  },
  description: 'Discover exclusive streetwear pieces and artist collaborations at Cherry Twins. Premium quality, bold designs.',
  keywords: ['streetwear', 'fashion', 'clothing', 'premium', 'urban fashion', 'artist collaborations'],
  authors: [{ name: 'Cherry Twins' }],
  openGraph: {
    title: 'Cherry Twins | Premium Streetwear',
    description: 'Discover exclusive streetwear pieces and artist collaborations.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Cherry Twins',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cherry Twins | Premium Streetwear',
    description: 'Discover exclusive streetwear pieces and artist collaborations.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
