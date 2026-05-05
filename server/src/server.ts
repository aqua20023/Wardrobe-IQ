import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";
import { scheduleDailyOutfitJob } from "./cron/dailyOutfitJob";

async function bootstrap() {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN === "*" ? "*" : env.CLIENT_ORIGIN.split(",")
    }
  });

  io.on("connection", (socket) => {
    socket.emit("ready", { service: "wardrobe-iq-realtime", aiEnabled: false });
  });

  scheduleDailyOutfitJob();

  httpServer.listen(env.PORT, () => {
    console.log(`[api] Wardrobe IQ listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error("[api] Failed to start", error);
  process.exit(1);
});
