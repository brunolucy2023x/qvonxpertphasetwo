'use client';

import "./globals.css";
import ContextProvider from "@/providers/ContextProvider";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs"; // stable import for Next.js 16

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const clerkFrontendApi: string = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || "";
if (!clerkFrontendApi) {
  throw new Error("Missing NEXT_PUBLIC_CLERK_FRONTEND_API in .env file!");
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      frontendApi={clerkFrontendApi}
      navigate={(to: string) => {
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", to);
        }
      }}
    >
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
            integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </head>
        <body className={`${roboto.className} antialiased`}>
          <Toaster position="top-center" />
          <ContextProvider>{children}</ContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}