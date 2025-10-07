import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers' // Provider untuk dark/light mode

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard Konten Interaktif',
  description: 'Dashboard interaktif dari data Google Sheets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 'suppressHydrationWarning' penting untuk next-themes agar tidak ada error
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 'Providers' membungkus seluruh aplikasi agar tema bisa berfungsi */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}