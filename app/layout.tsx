import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
              <div className="flex items-center">
                <h1 className="text-lg font-normal tracking-wider">EXEGIUS</h1>
              </div>
              <div className="flex items-center space-x-8">
                <button className="text-gray-500 hover:text-black text-sm transition-colors">
                  About
                </button>
                <button className="text-gray-500 hover:text-black text-sm transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}