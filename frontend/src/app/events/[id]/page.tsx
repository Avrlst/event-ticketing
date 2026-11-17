"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script"; // <-- Import Script Next.js
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Memberi tahu TypeScript bahwa window.snap itu ada
declare global {
  interface Window {
    snap: any;
  }
}

interface TicketTier {
  id: string;
  name: string;
  price: number;
  total_quota: number; // <-- Sudah disesuaikan dengan koreksimu
}

interface EventDetail {
  id: string;
  name: string;
  event_date: string;
  location: string;
  description: string;
  ticket_tiers?: TicketTier[]; 
  ticketTiers?: TicketTier[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk melacak tombol tiket mana yang sedang di-klik (loading)
  const [processingTicketId, setProcessingTicketId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/events/${params.id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Event tidak ditemukan");
        setEvent(data.data || data);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchEventDetail();
  }, [params.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tanggal belum ditentukan";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Format tanggal tidak sesuai";
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  // FUNGSI UTAMA PEMBELIAN TIKET
  const handleBuyTicket = async (ticketTierId: string) => {
    const token = localStorage.getItem("token");
    
    // Jika belum login, tendang ke halaman login
    if (!token) {
      alert("Silakan masuk (login) terlebih dahulu untuk membeli tiket.");
      router.push("/login");
      return;
    }

    setProcessingTicketId(ticketTierId);

    try {
      // 1. Tembak API Backend untuk membuat Order
      const response = await fetch("http://localhost:5000/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Wajib dikirim agar backend tahu siapa yang beli
        },
        body: JSON.stringify({
          event_id: params.id,
          ticket_tier_id: ticketTierId,
          quantity: 1 // Sebagai contoh awal, kita *hardcode* beli 1 tiket dulu
        }),
      });

      const data = await response.json();
      // Tambahkan log ini untuk melihat struktur response asli dari backend di DevTools Console
      console.log("Response dari POST /orders:", data);
      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat pesanan");
      }

      const snapToken = data.data?.snap_token;

    if (snapToken) {
    window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
        alert("Pembayaran berhasil!");
        router.push("/dashboard/tickets");
        },
        onPending: function (result: any) {
        alert("Pesanan dibuat! Silakan selesaikan pembayaran.");
        router.push("/dashboard/tickets");
        },
        onError: function (result: any) {
        alert("Pembayaran gagal atau dibatalkan.");
        },
        onClose: function () {
        alert("Kamu menutup popup Midtrans tanpa menyelesaikan pembayaran.");
        }
    });
    } else {
    alert("Snap token tidak ditemukan dari response server.");
    }

    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessingTicketId(null);
    }
  };

  const availableTickets = event?.ticket_tiers || event?.ticketTiers || [];

  if (isLoading) return <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-zinc-950"><div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div></main>;
  if (errorMsg || !event) return <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-zinc-950 space-y-4"><div className="text-red-400 p-4 bg-red-950/30 border border-red-900/50 rounded-lg">{errorMsg || "Data event tidak tersedia."}</div><Button variant="outline" onClick={() => router.push("/events")} className="text-zinc-950">Kembali</Button></main>;

  return (
    <>
      {/* Script Midtrans diletakkan di luar struktur <main> */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="lazyOnload" 
      />

      <main className="min-h-screen p-6 md:p-12 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <button onClick={() => router.push("/events")} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            ← Kembali
          </button>

          <div className="space-y-4 border-b border-zinc-800 pb-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{event.name}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-zinc-400 text-lg">
              <span className="flex items-center gap-2">📅 {formatDate(event.event_date)}</span>
              <span className="flex items-center gap-2">📍 {event.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Tentang Event</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold">Pilih Tiket</h2>
            
            {availableTickets.length === 0 ? (
              <div className="p-6 border border-zinc-800 rounded-lg text-center text-zinc-500 bg-zinc-900/20">
                Belum ada kategori tiket untuk event ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-zinc-900/40 border-zinc-800 flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white">{ticket.name}</CardTitle>
                      <p className="text-zinc-400 text-sm">Sisa Kuota: {ticket.total_quota}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-extrabold text-white mb-6">
                        {formatRupiah(ticket.price)}
                      </p>
                      
                      {/* Tombol Beli yang sudah terhubung dengan fungsi handleBuyTicket */}
                      <Button 
                        onClick={() => handleBuyTicket(ticket.id)}
                        disabled={ticket.total_quota <= 0 || processingTicketId === ticket.id}
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold disabled:bg-zinc-800 disabled:text-zinc-500"
                      >
                        {processingTicketId === ticket.id 
                          ? "Memproses..." 
                          : ticket.total_quota <= 0 
                            ? "Habis Terjual" 
                            : "Beli Tiket Ini"
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}