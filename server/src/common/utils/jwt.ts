import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

export interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role?: string;
}

export function signAccessToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
