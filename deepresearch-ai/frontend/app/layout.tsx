import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })

export const metadata: Metadata = {
  title: 'DeepResearch AI',
  description: 'Research Anything. In Minutes. Multi-agent AI collaboration.',
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
