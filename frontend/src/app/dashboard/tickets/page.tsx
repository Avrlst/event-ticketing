"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  total_amount: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  created_at: string;
  order_items?: {
    ticket_tier: {
      name: string;
      event: {
        name: string;
        event_date: string;
        location: string;
      };
    };
  }[];
}

export default function MyTicketsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchMyTickets = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/v1/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil riwayat tiket");
        }

        setOrders(data.data || data);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, [router]);

  // Tanda tanya (?) sudah ditambahkan di sini agar TypeScript aman
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BERHASIL</span>;
      case "PENDING":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">MENUNGGU PEMBAYARAN</span>;
      case "EXPIRED":
      case "CANCELLED":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">KEDALUWARSA</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Tiket Saya</h1>
          <p className="text-zinc-400 text-lg mt-2">Daftar transaksi dan tiket acara yang kamu beli.</p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg">
            {errorMsg}
          </div>
        )}

        {!isLoading && !errorMsg && orders.length === 0 && (
          <div className="text-center py-20 border border-zinc-800/50 rounded-xl bg-zinc-900/20 space-y-4">
            <p className="text-zinc-500">Kamu belum memiliki transaksi tiket apapun.</p>
            <Button onClick={() => router.push("/events")} className="bg-white text-zinc-950 font-semibold rounded-full">
              Cari Event Sekarang
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const item = order.order_items?.[0];
            const ticketTierObj = item?.ticket_tier;
            const eventObj = ticketTierObj?.event;

            return (
              <Card key={order.id} className="bg-zinc-900/40 border-zinc-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">{eventObj?.name || "Event Tiket"}</CardTitle>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400 border-y border-zinc-800/50 py-3 my-2">
                    <div>
                      <p className="text-xs text-zinc-500">Kategori Tiket</p>
                      <p className="font-semibold text-zinc-200">{ticketTierObj?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tanggal Acara</p>
                      <p className="font-semibold text-zinc-200">{formatDate(eventObj?.event_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Lokasi</p>
                      <p className="font-semibold text-zinc-200">{eventObj?.location || "-"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <p className="text-xs text-zinc-500">Total Pembayaran</p>
                      <p className="text-lg font-extrabold text-white">{formatRupiah(order.total_amount)}</p>
                    </div>
                    <p className="text-xs text-zinc-500">Dipesan pada {formatDate(order.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}