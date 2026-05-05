import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { validate } from "../../common/middleware/validate";
import { userController } from "./user.controller";
import { updatePreferencesSchema, updateProfileSchema } from "./user.validators";

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get("/me", userController.getProfile);
userRoutes.patch("/me", validate({ body: updateProfileSchema }), userController.updateProfile);
userRoutes.patch("/me/preferences", validate({ body: updatePreferencesSchema }), userController.updatePreferences);
