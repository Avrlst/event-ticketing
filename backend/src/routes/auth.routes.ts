import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { authenticateJWT, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

// Endpoint profile umum
router.get("/me", authenticateJWT, getMe);

// Contoh endpoint tes role guard
router.get("/organizer/dashboard", authenticateJWT, requireRole("ORGANIZER"), (req, res) => {
  res.json({ message: `Halo Organizer ${req.user?.email}, akses diizinkan.` });
});

export default router;