import {
  createContext,
  useEffect,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

import { User } from "@masterchef/shared/types/user";

export interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tempUser = localStorage.getItem("user");
    if (tempUser) {
      setUser(JSON.parse(tempUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const logout = () => {
    // Just enough time to let all transitions complete then wiping all local data
    setTimeout(() => setUser(null), 200);
    localStorage.removeItem("user");
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
