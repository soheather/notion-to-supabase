import type React from "react"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen bg-[#f0f5f5]">
            <Sidebar />
            <div className="flex-1 overflow-x-hidden">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
