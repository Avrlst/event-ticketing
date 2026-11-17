import { Router } from "express";
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../controllers/event.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { createEventSchema, updateEventSchema } from "../validations/event.validation";
import { authenticateJWT, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);

// POST /api/v1/events
// Dilindungi: Harus bawa token JWT, role harus ORGANIZER, body harus lolos validasi Zod
router.post(
  "/",
  authenticateJWT,
  requireRole("ORGANIZER"),
  validateRequest(createEventSchema),
  createEvent
);

// Rute untuk Update (PUT)
router.put(
  "/:id",
  authenticateJWT,
  requireRole("ORGANIZER"),
  validateRequest(updateEventSchema),
  updateEvent
);

// Rute untuk Delete (DELETE)
router.delete(
  "/:id",
  authenticateJWT,
  requireRole("ORGANIZER"),
  deleteEvent
);

export default router;