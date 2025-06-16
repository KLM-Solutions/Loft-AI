import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import * as amplitude from '@amplitude/unified';

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import AmplitudeProvider from "./AmplitudeProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Loft AI - Your bookmarks, remembered",
  description: "Save anything. Find it when it matters.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Loft AI - Your bookmarks, remembered</title>
          <meta name="description" content="Save anything. Find it when it matters." />
          <script src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"></script>
          <script src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
                window.amplitude.init('fa873e9f0243314709b6c74ca9bef518');
              `,
            }}
          />
        </head>
        <body className={inter.className}>
          <AmplitudeProvider />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
