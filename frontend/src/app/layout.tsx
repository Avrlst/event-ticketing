import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <-- 1. Import Navbar

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"] // Membawa variasi ketebalan font
});

export const metadata: Metadata = {
  title: "Ticketing - Premium Events",
  description: "Platform pemesanan tiket event generasi baru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* antialiased membuat ujung font lebih halus di layar resolusi tinggi */}
      <body className={`${plusJakarta.className} antialiased bg-zinc-950 text-zinc-50`}>
        <Navbar /> {/* <-- 2. Tambahkan Navbar di atas konten utama */}
        <div className="pt-16">
          {children}
          </div> {/* <-- 3. Tambahkan padding-top agar konten tidak tertutup Navbar */}
      </body>
    </html>
  );
}