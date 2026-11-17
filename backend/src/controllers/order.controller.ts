import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateOrderInput } from "../validations/order.validation";

const midtransClient = require("midtrans-client");
const prisma = new PrismaClient();

export const createOrder = async (
  req: Request<{}, {}, CreateOrderInput>,
  res: Response
): Promise<void> => {
  try {
    const { event_id, ticket_tier_id, quantity } = req.body;
    const customerId = String(req.user?.userId);
    const customerEmail = req.user?.email || "";

    // Gunakan Interactive Transaction dari Prisma
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. Pessimistic Locking: Ambil data tier tiket dan KUNCI barisnya di MySQL
      // Kita gunakan raw query karena membutuhkan perintah FOR UPDATE
      const tiers: any[] = await tx.$queryRaw`
        SELECT * FROM ticket_tiers 
        WHERE id = ${ticket_tier_id} AND event_id = ${event_id}
        FOR UPDATE
      `;

      if (tiers.length === 0) {
        throw new Error("TIER_NOT_FOUND");
      }

      const tier = tiers[0];

      // 2. Validasi stok tiket (Mencegah Overselling)
      if (tier.available_stock < quantity) {
        throw new Error("OUT_OF_STOCK");
      }

      // 3. Potong stok tiket yang tersedia
      // Catatan: Pastikan nama model Prisma kamu adalah ticketTier, atau sesuaikan dengan skemamu
      await tx.ticketTier.update({
        where: { id: ticket_tier_id },
        data: {
          available_stock: tier.available_stock - quantity,
        },
      });

      // 4. Hitung total harga
      const totalAmount = tier.price * quantity;

      // 5. Buat record Order & OrderItem dengan status PENDING
      const newOrder = await tx.order.create({
        data: {
          customer_id: customerId,
          total_amount: totalAmount,
          status: "PENDING",
          // snap_token dan redirect_url akan di-generate nanti oleh Midtrans
          order_items: {
            create: {
              ticket_tier_id: ticket_tier_id,
              quantity: quantity,
              subtotal: totalAmount,
            },
          },
        },
        include: {
          order_items: true,
        },
      });

      return newOrder;
    });
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    const parameters = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Number(order.total_amount),
      },
      customer_details: {
        email: customerEmail,
      },
    };

    const midtransResponse = await snap.createTransaction(parameters);

    const finalOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        snap_token: midtransResponse.token,
        snap_redirect_url: midtransResponse.redirect_url,
      },
      include: {
        order_items: true,
      },
    });

    res.status(201).json({
      message: "Order berhasil dibuat! Segera lakukan pembayaran.",
      data: finalOrder,
    });

  } catch (error: any) {
    console.error("Create Order Error:", error);
    
    // Tangani custom error dari dalam transaction
    if (error.message === "TIER_NOT_FOUND") {
      res.status(404).json({ message: "Tiket atau Event tidak ditemukan" });
      return;
    }
    if (error.message === "OUT_OF_STOCK") {
      res.status(400).json({ message: "Maaf, stok tiket tidak mencukupi atau sudah habis" });
      return;
    }

    res.status(500).json({ message: "Terjadi kesalahan pada server saat memproses pesanan" });
  }
};

// Fungsi untuk melihat riwayat pesanan milik Customer yang sedang login
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = String(req.user?.userId);

    const orders = await prisma.order.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        order_items: {
        include :{
          ticket_tier: {
            include: {
              event: true, // Sertakan data event agar bisa ditampilkan di frontend
            },
          },
        }
        } // Tampilkan juga detail item tiket yang dibeli
      },
      orderBy: {
        created_at: "desc", // Urutkan dari pesanan yang paling baru dibuat
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil riwayat pesanan",
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: "Gagal mengambil data pesanan" });
  }
};