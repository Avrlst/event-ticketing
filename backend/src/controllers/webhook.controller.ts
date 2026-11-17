import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const midtransWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Data ini dikirim otomatis oleh server Midtrans
    const { order_id, transaction_status, fraud_status } = req.body;

    // Cari order di database berdasarkan ID dari Midtrans
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { order_items: true }, // Bawa data item untuk keperluan rollback tiket
    });

    if (!order) {
      res.status(404).json({ message: "Order tidak ditemukan" });
      return;
    }

    let newStatus = order.status;

    // Logika penentuan status pembayaran dari Midtrans
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        newStatus = "PAID";
      }
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      newStatus = "EXPIRED";
    } else if (transaction_status === "pending") {
      newStatus = "PENDING";
    }

    // Jika status berubah, update database
    if (newStatus !== order.status) {
      await prisma.$transaction(async (tx) => {
        // 1. Update status order menjadi PAID atau EXPIRED
        await tx.order.update({
          where: { id: order_id },
          data: { status: newStatus },
        });

        // 2. ROLLBACK MECHANISM: Jika status EXPIRED/CANCELLED, kembalikan kuota tiket!
        if (newStatus === "EXPIRED") {
          for (const item of order.order_items) {
            await tx.ticketTier.update({
              where: { id: item.ticket_tier_id },
              data: {
                // Tambahkan kembali stok yang sebelumnya di-booking
                available_stock: { increment: item.quantity },
              },
            });
          }
        }
      });
    }

    // WAJIB merespon 200 OK ke Midtrans agar mereka tahu notifikasinya sudah kita terima
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};