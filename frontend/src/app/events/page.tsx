"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Struktur data (Type) untuk mempermudah auto-complete di VS Code
interface Event {
  id: string;
  name: string;
  event_date: string;
  location: string;
  description: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Panggil API Backend
        const response = await fetch("http://localhost:5000/api/v1/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data event");
        }

        // Simpan data event ke dalam state (menyesuaikan format JSON backend-mu)
        setEvents(data.data || data);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fungsi untuk memformat tanggal menjadi format Indonesia (Contoh: 16 Oktober 2026)
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Halaman */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Jelajahi <span className="text-zinc-500">Event.</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Temukan pengalaman tak terlupakan berikutnya.
          </p>
        </div>

        {/* State Loading */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* State Error */}
        {errorMsg && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Grid Katalog Event */}
        {!isLoading && !errorMsg && events.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            Belum ada event yang tersedia saat ini.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-colors duration-300 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white line-clamp-1">
                  {event.name}
                </CardTitle>
                <div className="text-sm text-zinc-400 space-y-1 mt-2">
                  <p className="flex items-center gap-2">
                    <span className="text-lg">📅</span> {formatDate(event.event_date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-lg">📍</span> {event.location}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Menampilkan deskripsi event maksimal 2 baris (line-clamp) */}
                <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
              
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg">
                    Lihat Detail
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>
    </main>
  );
}