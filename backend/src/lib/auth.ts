import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { config } from "../config/index.js";

// Lazy singleton — initialized on first request, after mongoose has connected
let _auth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!_auth) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error(
        "MongoDB not connected. Ensure connectDatabase() has been called before handling requests.",
      );
    }

    _auth = betterAuth({
      database: mongodbAdapter(db),
      secret: config.betterAuthSecret,
      baseURL: config.betterAuthUrl,
      trustedOrigins: [config.frontendUrl],

      emailAndPassword: {
        enabled: true,
      },

      socialProviders: {
        google: {
          clientId: config.googleClientId,
          clientSecret: config.googleClientSecret,
        },
        github: {
          clientId: config.githubClientId,
          clientSecret: config.githubClientSecret,
          // Request user:email so we can read private GitHub emails too
          scope: ["user:email"],
        },
      },

      // Allow Google/GitHub to auto-link to existing email accounts
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["google", "github"],
        },
      },

      user: {
        additionalFields: {
          pfp: { type: "string", nullable: true, input: true },
          age: { type: "number", nullable: true, input: true },
          birth: { type: "string", nullable: true, input: true },
          weight: { type: "number", nullable: true, input: true },
          height: { type: "number", nullable: true, input: true },
          bio: { type: "string", nullable: true, input: true },
          dietary_restric: { type: "string[]", nullable: true, input: true },
          allergies: { type: "string[]", nullable: true, input: true },
          skill_level: { type: "string", nullable: true, input: true },
          cuisines_pref: { type: "string[]", nullable: true, input: true },
          isCustomized: { type: "boolean", defaultValue: false, input: true },
        },
        deleteUser: {
          enabled: true,
          beforeDelete: async () => {
            // Idk how we'll do that, but we basically have make sure that no user owns a recipe of this user
          },
        },
      },

      // Ensure isCustomized is always explicitly set to false for new users
      // (BetterAuth may not apply additionalField defaults during OAuth user creation)
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              return {
                data: {
                  ...user,
                  isCustomized:
                    (user as Record<string, unknown>).isCustomized ?? false,
                },
              };
            },
          },
        },
      },
    });
  }

  return _auth;
}
