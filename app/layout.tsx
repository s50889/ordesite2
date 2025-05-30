import './globals.css'
import { Metadata, Viewport } from 'next'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import NetworkStatus from '@/components/NetworkStatus'

export const metadata: Metadata = {
  title: 'Tatsumi Ordersite - 工業資材注文管理システム',
  description: '辰巳産業の工業資材をオンラインで簡単に注文・管理できるシステム',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tatsumi Order',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Tatsumi Ordersite',
    title: 'Tatsumi Ordersite - 工業資材注文管理システム',
    description: '辰巳産業の工業資材をオンラインで簡単に注文・管理できるシステム',
  },
  twitter: {
    card: 'summary',
    title: 'Tatsumi Ordersite',
    description: '辰巳産業の工業資材をオンラインで簡単に注文・管理できるシステム',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <NetworkStatus />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  )
}
