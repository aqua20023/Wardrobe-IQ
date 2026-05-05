import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../../modules/users/user.model";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return next(new AppError("Authentication required", 401));

  try {
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub).select("_id email role").lean();

    if (!user) return next(new AppError("User no longer exists", 401));

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role ?? "user"
    };

    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(req.user.role)) return next(new AppError("Insufficient permissions", 403));
    next();
  };
}
