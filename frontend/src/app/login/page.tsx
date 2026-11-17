"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal. Periksa kembali email dan password Anda.");
      }

      // 1. Tangkap token dan data user dari response backend
      // (Menyesuaikan dengan struktur response JSON dari controller backend-mu)
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (token) {
        // 2. Simpan token ke localStorage browser
        localStorage.setItem("token", token);
        
        // Simpan data user (opsional, tapi berguna untuk menampilkan nama di Navbar nanti)
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        alert("Login berhasil!");
        
        // 3. Arahkan kembali ke halaman utama
        router.push("/");
      } else {
        throw new Error("Token tidak ditemukan dari server.");
      }
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900/40 border-zinc-800 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-white tracking-tight">Selamat Datang</CardTitle>
          <CardDescription className="text-zinc-400">
            Masukkan email dan password untuk masuk ke akunmu
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com" 
                className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-zinc-700" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-full disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
            <p className="text-sm text-center text-zinc-400">
              Belum punya akun?{" "}
              <Link href="/register" className="text-white hover:text-zinc-300 font-medium hover:underline underline-offset-4">
                Daftar sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}