import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/source-sans-3'
import './globals.css'

const ROBOTS = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
}

export const metadata: Metadata = {
  title: 'Flight radar',
  robots: ROBOTS,
  referrer: 'no-referrer',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
