"use client"; // Wajib untuk interaksi user & state di Next.js App Router

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  
  // State untuk menyimpan inputan user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });
  
  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh saat submit
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat mendaftar");
      }

      // Jika berhasil, arahkan ke halaman login
      alert("Pendaftaran berhasil! Silakan login.");
      router.push("/login");
      
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
          <CardTitle className="text-2xl font-extrabold text-white tracking-tight">Buat Akun Baru</CardTitle>
          <CardDescription className="text-zinc-400">
            Daftar untuk mulai membeli atau membuat event
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
              <Label htmlFor="name" className="text-zinc-300">Nama Lengkap</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nama Lengkap" 
                className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com" 
                className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-zinc-300">Daftar Sebagai</Label>
              <select 
                id="role" 
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
              >
                <option value="CUSTOMER">Customer (Membeli Tiket)</option>
                <option value="ORGANIZER">Organizer (Membuat Event)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-full disabled:opacity-50"
            >
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </Button>
            <p className="text-sm text-center text-zinc-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-white hover:text-zinc-300 font-medium hover:underline underline-offset-4">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}