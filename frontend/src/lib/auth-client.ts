import { createAuthClient } from "better-auth/react";

// VITE_BASE_API_URL is http://localhost:4000/api — BetterAuth needs the root origin
const serverOrigin = (import.meta.env.VITE_BASE_API_URL as string | undefined)
  ?.replace(/\/api$/, "") ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: serverOrigin,
});
