import Provider from '@/app/provider'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthWrapper from '@/components/wrapper/auth-wrapper'
import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  metadataBase: new URL("https://vdcapital.org"),
  title: {
    default: 'VD Capital',
    template: `%s | VD Capital Trading Hub`
  },
  description: 'VD Capital: Your ultimate trading hub with a powerful trading terminal, in-depth market analysis, and accurate market predictions. Learn, trade, and grow your portfolio with expert tools and education.',
  openGraph: {
    description: 'VD Capital: Your ultimate trading hub with a powerful trading terminal, in-depth market analysis, and accurate market predictions. Learn, trade, and grow your portfolio with expert tools and education.',
    images: ['https://utfs.io/f/uZI7cs6PPAxIo50tgiSUbfXN7zPi3lgu9dJkAqI8hor4Zmpv'],
    url: 'https://vdcapital.org/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VD Capital',
    description: 'VD Capital: Your ultimate trading hub with a powerful trading terminal, in-depth market analysis, and accurate market predictions. Learn, trade, and grow your portfolio with expert tools and education.',
    siteId: "",
    creator: "@vdcapital",
    creatorId: "",
    images: ['https://utfs.io/f/uZI7cs6PPAxIo50tgiSUbfXN7zPi3lgu9dJkAqI8hor4Zmpv'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="preload"
            href="https://utfs.io/f/31dba2ff-6c3b-4927-99cd-b928eaa54d5f-5w20ij.png"
            as="image"
          />
          <link
            rel="preload"
            href="https://utfs.io/f/uZI7cs6PPAxIt7QykmfTX72QNHDGzs8gLOyUkixRMYJd16rZ"
            as="image"
          />
        </head>
        <body className={GeistSans.className}>
        <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
        </Provider>
        <Analytics />
      </body>
      </html>
    </AuthWrapper>
  )
}