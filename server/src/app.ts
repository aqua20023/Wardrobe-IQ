import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiSpec } from "./config/openapi";
import { apiRateLimiter } from "./common/middleware/rateLimiter";
import { errorHandler, notFound } from "./common/middleware/errorHandler";
import { v1Routes } from "./routes/v1";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(","),
      credentials: true
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(apiRateLimiter);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
  app.use(env.API_PREFIX, v1Routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
