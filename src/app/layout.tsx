import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import FacebookPixel from "./_components/fb-pixel";
import { NuqsAdapter } from "nuqs/adapters/next";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "~/server/uploadthing";

export const metadata: Metadata = {
  title: "Parted Euro",
  description: "BMW Wrecking/Spares/Parts",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
            <NuqsAdapter>{children}</NuqsAdapter>
          </TRPCReactProvider>
          <Toaster />
          <FacebookPixel />
        </ThemeProvider>
      </body>
    </html>
  );
}
