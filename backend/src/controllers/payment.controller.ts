import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const midtransWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    console.log("=== WEBHOOK DARI MIDTRANS MASUK ===");
    console.log("Status:", data.transaction_status, "| Order ID:", data.order_id);
    // 1. Verifikasi Signature Key (Keamanan)
    // Pastikan request ini BENAR-BENAR dari Midtrans
    const signatureKey = crypto
      .createHash("sha512")
      .update(
        `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
      )
      .digest("hex");

    if (signatureKey !== data.signature_key) {
       res.status(403).json({ message: "Invalid Signature Key" });
       return;
    }

    const { order_id, transaction_status, fraud_status } = data;

    // 2. Ambil data Order beserta Item-nya
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { order_items: true },
    });

    if (!order) {
       res.status(404).json({ message: "Order not found" });
       return;
    }

    // 3. Tentukan Status Baru berdasarkan Status Midtrans
    let newStatus = order.status;
    let shouldRollback = false;

    if (transaction_status === "capture") {
      if (fraud_status === "accept") newStatus = "PAID";
    } else if (transaction_status === "settlement") {
      newStatus = "PAID";
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      newStatus = transaction_status === "expire" ? "EXPIRED" : "CANCELLED";
      shouldRollback = true;
    } else if (transaction_status === "pending") {
      newStatus = "PENDING";
    }

    // 4. Update Status Order dan Lakukan Rollback Kuota (Jika Perlu) menggunakan Transaction
    await prisma.$transaction(async (tx) => {
      // Update status order
      if (order.status !== newStatus) {
        await tx.order.update({
          where: { id: order_id },
          data: { status: newStatus as any }, // casting ke enum
        });
      }

      // Lakukan Rollback (Kembalikan Stok) jika order kadaluarsa/dibatalkan DAN status sebelumnya bukan sudah expired/cancelled
      if (shouldRollback && order.status !== "EXPIRED" && order.status !== "CANCELLED") {
        for (const item of order.order_items) {
           await tx.ticketTier.update({
              where: { id: item.ticket_tier_id },
              data: {
                 available_stock: { increment: item.quantity } // Mengembalikan stok
              }
           });
        }
      }
    });

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error during webhook processing" });
  }
};