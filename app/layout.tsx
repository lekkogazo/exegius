import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Exegius - Flight Search",
  description: "Find the best flight deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black antialiased`}>
        <nav className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between h-14 items-center">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-lg font-normal tracking-wider">
                  EXEGIUS
                </Link>
                <div className="flex items-center space-x-6">
                  <Link href="/terms" className="text-gray-500 hover:text-black text-sm transition-colors">
                    Terms
                  </Link>
                  <Link href="/privacy" className="text-gray-500 hover:text-black text-sm transition-colors">
                    Privacy
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Link href="/about" className="text-gray-500 hover:text-black text-sm transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-black text-sm transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}