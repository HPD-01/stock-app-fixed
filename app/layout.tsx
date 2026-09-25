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
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">

        {/* TOP HEADER */}
        <header className="bg-slate-800 text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">

            <Link href="/office" className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Harkness Painting & Decorating"
                className="h-20 w-auto object-contain"
              />

              <div>
                <h1 className="m-0 text-3xl font-bold">
                  Stock Control
                </h1>

                <p className="mt-1 text-sm text-gray-300">
                  Stock Management
                </p>
              </div>
            </Link>

          </div>
        </header>

        {/* NAVIGATION */}
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-8 overflow-x-auto whitespace-nowrap px-6">

            <Link
              href="/office"
              className="border-b-2 border-transparent px-1 py-4 font-medium hover:border-blue-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/issue"
              className="border-b-2 border-transparent px-1 py-4 font-medium hover:border-blue-600 hover:text-blue-600"
            >
              Issue
            </Link>

            <Link
              href="/office/movements"
              className="border-b-2 border-transparent px-1 py-4 font-medium hover:border-blue-600 hover:text-blue-600"
            >
              Movements
            </Link>

            <Link
              href="/office/adjustments"
              className="border-b-2 border-transparent px-1 py-4 font-medium hover:border-blue-600 hover:text-blue-600"
            >
              Adjustments
            </Link>

          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="mx-auto max-w-6xl px-6 py-6 pb-24">
          {children}
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="mobile-nav">
          <Link href="/office">Dashboard</Link>
          <Link href="/issue">Issue</Link>
          <Link href="/office/adjustments">Adjust</Link>
          <Link href="/office/movements">Movements</Link>
        </div>

      </body>
    </html>
  );
}