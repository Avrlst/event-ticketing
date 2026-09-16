# Event Ticketing Platform - Project Specification

## 1. Tech Stack
- **Architecture**: Monorepo (`backend/` & `frontend/`)
- **Backend**: Node.js, Express/Fastify, TypeScript, Prisma ORM
- **Database**: MySQL
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: JWT (Roles: `CUSTOMER`, `ORGANIZER`)
- **Payment Gateway**: Midtrans Snap Sandbox + Webhook Handler
- **Concurrency**: DB Transaction + Pessimistic Locking (`SELECT ... FOR UPDATE`)

## 2. Core Entities
1. **User**: `id`, `name`, `email`, `password_hash`, `role` (CUSTOMER, ORGANIZER), `created_at`
2. **Event**: `id`, `organizer_id`, `title`, `description`, `location`, `banner_url`, `event_date`, `status`
3. **TicketTier**: `id`, `event_id`, `name` (e.g. VIP, Regular), `price`, `total_quota`, `available_stock`
4. **Order**: `id`, `customer_id`, `total_amount`, `status` (PENDING, PAID, EXPIRED, CANCELLED), `snap_token`, `snap_redirect_url`, `created_at`
5. **OrderItem**: `id`, `order_id`, `ticket_tier_id`, `quantity`, `subtotal`

## 3. High-Concurrency Flow (Anti-Overselling)
1. Mulai DB Transaction.
2. Query tier: `SELECT * FROM ticket_tiers WHERE id = ? FOR UPDATE`.
3. Validasi: `available_stock >= requested_qty`.
4. Potong stok langsung saat *create order*: `UPDATE ticket_tiers SET available_stock = available_stock - requested_qty`.
5. Buat data `Order` & `OrderItem` dengan status `PENDING`.
6. Panggil Midtrans Snap API untuk token transaksi.
7. Commit Transaction.
8. Background job / Webhook: Jika status order `EXPIRED` atau `CANCELLED`, *rollback* (tambahkan kembali) kuota tiket.

## 4. Roadmap Modul
- [x] **Modul 1: Setup Backend & Skema Prisma MySQL**
- [ ] **Modul 2: Auth Service (Register, Login, Role-Based Middleware)**
- [ ] **Modul 3: Event & Multi-Tier Ticket CRUD (Organizer)**
- [ ] **Modul 4: Booking Engine with Pessimistic Locking + Midtrans Snap**
- [ ] **Modul 5: Midtrans Webhook Handler & Ticket Rollback Mechanism**
- [ ] **Modul 6: Setup Frontend Next.js + Event Catalog & Booking Flow**