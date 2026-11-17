"use client"; // Ubah menjadi Client Component agar bisa membaca localStorage

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // useEffect akan berjalan di sisi klien (browser) untuk mengambil data dari localStorage
  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Hapus sesi pengguna dari browser
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
          TIX<span className="text-zinc-500">.ID</span>
        </Link>

        {/* Menu Navigasi Tengah */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/events" className="hover:text-white transition-colors duration-200">
            Semua Event
          </Link>
          {/* Jika user adalah ORGANIZER, tampilkan menu Buat Event */}
          {user?.role === "ORGANIZER" && (
            <Link href="/events/create" className="text-white hover:text-zinc-300 transition-colors duration-200 flex items-center gap-2">
              <span className="bg-white text-zinc-950 px-2 py-0.5 rounded-full text-xs font-bold">PRO</span>
              Buat Event
            </Link>
          )}
        </div>

        {/* Bagian Kanan (Auth / User Profile) */}
        <div className="flex items-center gap-4">
          {!isMounted ? (
             <div className="w-20 h-8 bg-zinc-800 animate-pulse rounded-full"></div> // Skeleton loading saat cek sesi
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-300 hidden sm:inline-block">
                Halo, {user.name.split(" ")[0]} {/* Ambil nama depan saja */}
              </span>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-full"
              >
                Keluar
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6 font-semibold">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}