import FacebookPixel from "../_components/fb-pixel";
import Footer from "./_components/Footer";
import Nav from "./_components/Nav";
import { ThemeProvider } from "~/components/theme-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        {/* Navigation */}
        <Nav />

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        <Footer />
      </div>
      {process.env.NODE_ENV === "production" && <FacebookPixel />}
    </ThemeProvider>
  );
}
