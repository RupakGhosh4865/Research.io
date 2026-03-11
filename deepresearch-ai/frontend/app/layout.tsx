import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })

export const metadata: Metadata = {
  title: {
    default: 'DeepResearch AI - Futuristic AI Research Assistant',
    template: '%s | DeepResearch AI'
  },
  description: 'Synthesize reality in minutes. A multi-agent AI collaboration platform for deep, comprehensive research.',
  keywords: ['AI Research', 'Multi-Agent System', 'Deep Research', 'AI Assistant', 'Automated Research', 'Data Synthesis'],
  authors: [{ name: 'DeepResearch AI Team' }],
  creator: 'DeepResearch AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://deepresearch-ai.vercel.app', // Update with actual production URL
    title: 'DeepResearch AI - Synthesize Reality',
    description: 'Multi-agent AI collaboration for deep, comprehensive research in minutes.',
    siteName: 'DeepResearch AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepResearch AI',
    description: 'Multi-agent AI collaboration for deep, comprehensive research in minutes.',
    creator: '@deepresearchai',
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${syne.variable} font-sans bg-[#050810] text-gray-100 antialiased`}>
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
