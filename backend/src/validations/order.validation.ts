import { z } from "zod";

export const createOrderSchema = z.object({
  event_id: z.string().min(1, "ID Event wajib diisi"),
  ticket_tier_id: z.string().min(1, "ID Tier Tiket wajib diisi"),
  quantity: z.number().int().min(1, "Minimal pembelian 1 tiket").max(4, "Maksimal pembelian 4 tiket per transaksi"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;