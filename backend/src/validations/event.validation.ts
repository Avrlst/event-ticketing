import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3, "Judul event minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  location: z.string().min(3, "Lokasi wajib diisi"),
  // Menggunakan validasi ISO 8601 untuk tanggal dan waktu
  event_date: z.string().datetime({ message: "Format tanggal tidak valid (gunakan ISO 8601, contoh: 2026-12-31T10:00:00Z)" }),
  // Event harus memiliki minimal 1 jenis/tier tiket saat dibuat
  ticket_tiers: z.array(
    z.object({
      name: z.string().min(1, "Nama tier wajib diisi (contoh: VIP, Regular)"),
      price: z.number().min(0, "Harga tiket tidak boleh negatif"),
      total_quota: z.number().min(1, "Kuota tiket minimal 1"),
    })
  ).min(1, "Minimal harus ada 1 tier tiket"),
});

export const updateEventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").optional(),
  location: z.string().min(3, "Lokasi minimal 3 karakter").optional(),
  event_date: z.string().datetime("Format tanggal tidak valid").optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;