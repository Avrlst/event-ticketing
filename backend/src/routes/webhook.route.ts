import { Router } from "express";
import { midtransWebhook } from "../controllers/payment.controller";

const router = Router();

// POST /api/v1/webhooks/midtrans
router.post("/midtrans", midtransWebhook);

export default router;