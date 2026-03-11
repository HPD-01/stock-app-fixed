import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Stock Control",
  description: "Internal Stock Control System",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">

        {/* HEADER */}
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">

            {/* Logo + Title */}
            <Link href="/office" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Company Logo"
                width="40"
                height="40"
              />
              <span className="text-lg font-semibold">
                Stock Control
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/office" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/issue" className="hover:text-blue-600">
                Issue
              </Link>
              <Link href="/office/movements" className="hover:text-blue-600">
                Movements
              </Link>
              <Link href="/office/adjustments" className="hover:text-blue-600">
                Adjustments
              </Link>
            </nav>

          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="mx-auto max-w-6xl px-6 py-6">
          {children}
        </main>

      </body>
    </html>
  );
}