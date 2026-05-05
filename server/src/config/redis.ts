import { createClient, RedisClientType } from "redis";
import { env } from "./env";

let client: RedisClientType | null = null;

export async function connectRedis() {
  if (!env.REDIS_URL) return null;
  if (client?.isOpen) return client;

  client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: false
    }
  });
  client.on("error", (error) => {
    if (env.NODE_ENV === "production") {
      console.error("[redis]", error);
    }
  });

  try {
    await client.connect();
    console.log("[redis] connected");
    return client;
  } catch (error) {
    client = null;
    const message = error instanceof Error ? error.message : "Redis connection failed";
    console.warn(`[redis] cache disabled: ${message}`);
    return null;
  }
}

export function getRedisClient() {
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!client?.isOpen) return null;
  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 120) {
  if (!client?.isOpen) return;
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheDeleteByPrefix(prefix: string) {
  if (!client?.isOpen) return;
  for await (const key of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
    await client.del(key);
  }
}
