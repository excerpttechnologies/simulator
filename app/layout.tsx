import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { SmoothScroll } from '@/components/landing/smooth-scroll'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AccountIn — Advanced Tax Simulation & Accounting Practice Platform',
  description: 'Become job-ready through real-time tax & accounting simulations. Master GST, TDS, Income Tax, EPFO, Payroll, UAE VAT and accounting processes for training institutes, colleges, and universities.',
  keywords: ['GST simulation', 'TDS training', 'tax simulation platform', 'accounting education', 'institution training', 'white label EdTech', 'CA coaching', 'UAE VAT training'],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`bg-background ${inter.variable} ${poppins.variable}`}>
      <body className="antialiased min-h-screen font-sans">
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster />
        <ChatbotWidget />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
