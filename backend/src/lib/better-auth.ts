import type { RequestHandler } from "express";
import { config } from "../config/index.js";
import { getMongoClient, getMongoDb } from "../config/database.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";

interface BetterAuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

let cachedHandler: RequestHandler | null = null;
let initPromise: Promise<RequestHandler | null> | null = null;
let initError: Error | null = null;

function hasBetterAuthConfig(): boolean {
  return Boolean(
    config.betterAuthSecret &&
      config.betterAuthUrl &&
      config.googleClientId &&
      config.googleClientSecret
  );
}

async function ensureProfileForAuthUser(user: BetterAuthUser): Promise<void> {
  if (!user.id) {
    return;
  }

  const email = user.email?.toLowerCase();
  if (!email) {
    return;
  }

  const legacyUser = email ? await User.findOne({ email }) : null;

  await Profile.findOneAndUpdate(
    { authUserId: user.id },
    {
      $setOnInsert: {
        authUserId: user.id,
        email,
        name: legacyUser?.name ?? user.name ?? "User",
        pfp: legacyUser?.pfp ?? user.image,
        age: legacyUser?.age,
        birth: legacyUser?.birth,
        weight: legacyUser?.weight,
        height: legacyUser?.height,
        bio: legacyUser?.bio,
        dietary_restric: legacyUser?.dietary_restric ?? [],
        allergies: legacyUser?.allergies ?? [],
        skill_level: legacyUser?.skill_level,
        cuisines_pref: legacyUser?.cuisines_pref ?? [],
        isCustomized: legacyUser?.isCustomized ?? false,
        legacyUserId: legacyUser?._id,
      },
    },
    { upsert: true, new: false }
  );
}

async function initializeHandler(): Promise<RequestHandler | null> {
  if (!hasBetterAuthConfig()) {
    return null;
  }

  try {
    const [{ betterAuth }, { mongodbAdapter }, { toNodeHandler }] = await Promise.all([
      import("better-auth"),
      import("better-auth/adapters/mongodb"),
      import("better-auth/node"),
    ]);

    const auth = betterAuth({
      database: mongodbAdapter(getMongoDb() as any, {
        client: getMongoClient() as any,
        // Local Mongo instances are often standalone (no replica set), so txs fail.
        transaction: false,
      }),
      secret: config.betterAuthSecret as string,
      baseURL: config.betterAuthUrl,
      trustedOrigins: [config.frontendUrl],
      socialProviders: {
        google: {
          clientId: config.googleClientId as string,
          clientSecret: config.googleClientSecret as string,
          prompt: "select_account",
        },
      },
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["google"],
        },
      },
      user: {
        modelName: config.betterAuthUserModelName,
      },
      databaseHooks: {
        user: {
          create: {
            after: async (createdUser: BetterAuthUser) => {
              await ensureProfileForAuthUser(createdUser);
            },
          },
        },
      },
    } as any);

    return toNodeHandler(auth);
  } catch (error) {
    initError = error instanceof Error ? error : new Error("Better Auth initialization failed");
    throw initError;
  }
}

async function getBetterAuthHandler(): Promise<RequestHandler | null> {
  if (cachedHandler) {
    return cachedHandler;
  }

  if (!initPromise) {
    initPromise = initializeHandler().then((handler) => {
      cachedHandler = handler;
      return handler;
    });
  }

  return initPromise;
}

export const betterAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const handler = await getBetterAuthHandler();

    if (!handler) {
      res.status(503).json({
        error: "Better Auth is not configured",
        requiredEnv: [
          "BETTER_AUTH_SECRET",
          "BETTER_AUTH_URL",
          "GOOGLE_CLIENT_ID",
          "GOOGLE_CLIENT_SECRET",
        ],
      });
      return;
    }

    handler(req, res, next);
  } catch (error) {
    next(initError ?? error);
  }
};
