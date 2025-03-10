import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import FacebookPixel from "./_components/fb-pixel";
import { NuqsAdapter } from "nuqs/adapters/next";

export const metadata: Metadata = {
  title: "Parted Euro",
  description: "BMW Wrecking/Spares/Parts",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TRPCReactProvider>
        <FacebookPixel />
      </body>
    </html>
  );
}
