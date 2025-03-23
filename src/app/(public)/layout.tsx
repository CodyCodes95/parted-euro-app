import Footer from "./_components/Footer";
import Nav from "./_components/Nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
}
