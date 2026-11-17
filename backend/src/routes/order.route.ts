import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { createOrderSchema } from "../validations/order.validation";
import { authenticateJWT, requireRole } from "../middlewares/auth.middleware";
import { midtransWebhook } from "../controllers/webhook.controller";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  requireRole("CUSTOMER"),
  getMyOrders
);
// POST /api/v1/orders
// Dilindungi: Harus bawa token JWT, role harus CUSTOMER, body harus lolos validasi
router.post(
  "/",
  authenticateJWT,
  requireRole("CUSTOMER"), // Organizer tidak boleh memesan tiket
  validateRequest(createOrderSchema),
  createOrder
);

router.post("/webhook", midtransWebhook);

export default router;