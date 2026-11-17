import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: number | string;
  email: string;
  role: "CUSTOMER" | "ORGANIZER";
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token otentikasi tidak ditemukan" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "fallbacksecret";

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};

export const requireRole = (...allowedRoles: Array<"CUSTOMER" | "ORGANIZER">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Akses tidak terotentikasi" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Forbidden: Anda tidak memiliki izin untuk akses resource ini",
      });
      return;
    }

    next();
  };
};