import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";
import { User } from "@masterchef/shared/types/user";

export interface UserContextType {
  user: User | null;
  // setUser is kept for compatibility — it triggers a session refresh
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();

  // Map BetterAuth session user to our User type
  const user = session?.user ? (session.user as unknown as User) : null;
  const loading = isPending;

  const logout = async () => {
    await authClient.signOut();
  };

  // After profile updates, components call setUser to refresh the displayed data.
  // With BetterAuth sessions we just re-fetch — the server has the updated user.
  const setUser = (_updatedUser: User | null) => {
    refetch();
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
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
