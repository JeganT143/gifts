import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, DM_Mono, Kalam } from 'next/font/google'
import { copy, site } from '@/config/treat'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const hand = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: copy.meta.title,
  description: copy.meta.description,
  applicationName: site.brand,
  openGraph: {
    type: 'website',
    siteName: site.brand,
    locale: 'en_IN',
    title: copy.meta.title,
    description: copy.meta.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: copy.meta.title,
    description: copy.meta.description,
  },
}

export const viewport: Viewport = {
  themeColor: '#F5B323',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  )
}
