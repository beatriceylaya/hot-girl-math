import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hot Girl Math Calculator',
  description: 'A fun and empowering loan and financial calculator',
  authors: [{ name: 'Your Name' }],
  keywords: ['finance', 'calculator', 'loans', 'financial planning'],
  openGraph: {
    title: 'Hot Girl Math Calculator',
    description: 'Make smart financial decisions with style',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}