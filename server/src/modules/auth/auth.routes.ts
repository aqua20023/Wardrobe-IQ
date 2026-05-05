import { Router } from "express";
import { validate } from "../../common/middleware/validate";
import { authController } from "./auth.controller";
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema } from "./auth.validators";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), authController.register);
authRoutes.post("/login", validate({ body: loginSchema }), authController.login);
authRoutes.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
authRoutes.post("/forgot-password", validate({ body: forgotPasswordSchema }), authController.forgotPassword);
authRoutes.post("/reset-password", validate({ body: resetPasswordSchema }), authController.resetPassword);
