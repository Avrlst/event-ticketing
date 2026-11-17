import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateEventInput } from "../validations/event.validation";

const prisma = new PrismaClient();

export const createEvent = async (
  req: Request<{}, {}, CreateEventInput>,
  res: Response
): Promise<void> => {
  try {
    const { title, description, location, event_date, ticket_tiers } = req.body;
    
    // Ambil ID user dari JWT payload yang di-set oleh middleware authenticateJWT
    const organizerId = String(req.user?.userId);

    if (!organizerId) {
      res.status(401).json({ message: "Sesi tidak valid, silakan login ulang" });
      return;
    }

    // Insert Event dan TicketTiers sekaligus (Prisma Transaction)
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        event_date: new Date(event_date),
        organizer_id: organizerId,
        ticket_tiers: {
          create: ticket_tiers.map((tier) => ({
            name: tier.name,
            price: tier.price,
            total_quota: tier.total_quota,
            // Saat event baru dibuat, stok tersedia harus sama dengan total kuota
            available_stock: tier.total_quota, 
          })),
        },
      },
      include: {
        ticket_tiers: true, // Meminta Prisma mengembalikan data tier tiket di response
      },
    });

    res.status(201).json({
      message: "Event dan tier tiket berhasil dibuat",
      data: newEvent,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat membuat event" });
  }
};

// Fungsi untuk mengambil semua daftar event (Katalog)
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        ticket_tiers: true, // Sertakan data tiket agar harga termurah bisa ditampilkan di frontend
      },
      orderBy: {
        event_date: "asc", // Urutkan dari event yang paling dekat waktunya
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil data event",
      data: events,
    });
  } catch (error) {
    console.error("Get All Events Error:", error);
    res.status(500).json({ message: "Gagal mengambil data event" });
  }
};

// Fungsi untuk mengambil detail 1 event berdasarkan ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticket_tiers: true, // Menampilkan sisa stok dan detail tier tiket
      },
    });

    if (!event) {
      res.status(404).json({ message: "Event tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil detail event",
      data: event,
    });
  } catch (error) {
    console.error("Get Event By ID Error:", error);
    res.status(500).json({ message: "Gagal mengambil detail event" });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.id);
    const organizerId = String(req.user?.userId);
    const data = req.body;

    // 1. Cek apakah event ada dan milik organizer yang sedang login
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    
    if (!existingEvent) {
      res.status(404).json({ message: "Event tidak ditemukan" });
      return;
    }
    
    if (existingEvent.organizer_id !== organizerId) {
      res.status(403).json({ message: "Akses ditolak: Anda bukan pembuat event ini" });
      return;
    }

    // 2. Lakukan Update (abaikan jika data tidak dikirim dari body)
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        location: data.location !== undefined ? data.location : undefined,
        event_date: data.event_date ? new Date(data.event_date) : undefined,
      },
    });

    res.status(200).json({
      message: "Event berhasil diperbarui",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Gagal memperbarui event" });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.id);
    const organizerId = String(req.user?.userId);

    // 1. Cek kepemilikan event
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    
    if (!existingEvent) {
      res.status(404).json({ message: "Event tidak ditemukan" });
      return;
    }
    
    if (existingEvent.organizer_id !== organizerId) {
      res.status(403).json({ message: "Akses ditolak: Anda bukan pembuat event ini" });
      return;
    }

    // 2. Hapus Event (Fitur Cascade Prisma akan otomatis menghapus tiket yang berelasi jika sudah diatur di schema.prisma)
    await prisma.event.delete({
      where: { id: eventId },
    });

    res.status(200).json({ message: "Event beserta tiketnya berhasil dihapus" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ message: "Gagal menghapus event. Pastikan tidak ada transaksi yang tertaut." });
  }
};