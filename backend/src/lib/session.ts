import crypto from "crypto";
import type { Request, Response } from "express";
import { config } from "../config/index.js";
import { User } from "../models/user.model.js";
import { UserSession } from "../models/session.model.js";

const SESSION_COOKIE_NAME = "mc_session";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .reduce<Record<string, string>>((acc, part) => {
      const [rawKey, ...rawValue] = part.split("=");
      if (!rawKey) {
        return acc;
      }

      acc[rawKey] = decodeURIComponent(rawValue.join("="));
      return acc;
    }, {});
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(res: Response, token: string, rememberMe: boolean): void {
  const maxAge = rememberMe ? THIRTY_DAYS_IN_MS : ONE_DAY_IN_MS;

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    path: "/",
  });
}

export async function createSessionForUser(
  res: Response,
  userId: string,
  rememberMe: boolean
): Promise<void> {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const ttl = rememberMe ? THIRTY_DAYS_IN_MS : ONE_DAY_IN_MS;

  await UserSession.create({
    tokenHash,
    userId,
    expiresAt: new Date(Date.now() + ttl),
  });

  setSessionCookie(res, token, rememberMe);
}

export async function resolveSessionUser(req: Request) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await UserSession.findOne({ tokenHash });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await UserSession.deleteOne({ _id: session._id });
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user) {
    await UserSession.deleteOne({ _id: session._id });
    return null;
  }

  return user;
}

export async function revokeSession(req: Request, res: Response): Promise<void> {
  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];

  if (token) {
    const tokenHash = hashSessionToken(token);
    await UserSession.deleteOne({ tokenHash });
  }

  clearSessionCookie(res);
}
