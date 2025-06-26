import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ForexProvider } from "@/contexts/forex-context"
import { SearchProvider } from "@/contexts/search-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FundingPips - Forex Tracker",
  description: "Real-time forex trading platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ForexProvider>
          <SearchProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </SearchProvider>
        </ForexProvider>
      </body>
    </html>
  )
}
