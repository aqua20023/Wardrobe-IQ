import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { validate } from "../../common/middleware/validate";
import { chatController } from "./chat.controller";
import { chatMessageSchema } from "./chat.validators";

export const chatRoutes = Router();

chatRoutes.use(authenticate);
chatRoutes.post("/message", validate({ body: chatMessageSchema }), chatController.message);
