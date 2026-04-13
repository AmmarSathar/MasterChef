import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";
import { User } from "@masterchef/shared/types/user";

export interface UserContextType {
  user: User | null;
  refetchUser: () => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function normalizeUser(sessionUser: unknown): User | null {
  if (!sessionUser || typeof sessionUser !== "object") return null;

  const record = sessionUser as Record<string, unknown>;
  const resolvedId =
    typeof record.id === "string"
      ? record.id
      : typeof record._id === "string"
        ? record._id
        : undefined;

  if (!resolvedId) return null;

  return {
    ...(record as unknown as User),
    id: resolvedId,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();

  // Map BetterAuth session user to our User type
  const user = normalizeUser(session?.user);
  const loading = isPending;

  const logout = async () => {
    await authClient.signOut();
  };

  // After profile updates, components call refetchUser to refresh the displayed data.
  // With BetterAuth sessions we just re-fetch — the server has the updated user.
  const refetchUser = refetch;

  return (
    <UserContext.Provider value={{ user, refetchUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
