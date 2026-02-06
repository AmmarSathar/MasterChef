import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, Plus, Bell, Search, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { User } from "@masterchef/shared/types/user";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded-lg ${className || ""}`}
    />
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [lastPage, setLastPage] = useState<string>("/");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      window.location.href = "/login";
      return;
    }
    const storedLastPage = localStorage.getItem("lastPage");
    if (storedLastPage) {
      setLastPage(storedLastPage);
    }
  }, []);

  return (
    <div className="dashboard-parent-container w-full h-screen flex relative justify-center items-center p-3 m-0">
      <div className="dashboard-container w-full h-full bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-0 px-5 ml-25 gap-5">
        <div className="dashboard-header w-full bg-card/80 h-40 flex justify-between items-center p-1">
          <div className="dashboard-header-left w-full h-full flex items-center justify-baseline relative gap-4">
            <button
              onClick={() => navigate(lastPage)}
              className="header-return w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <span className="text-xl font-bold text-accent/80">Dashboard</span>
          </div>
          <div className="dashboard-header-right w-full h-full flex items-center justify-end relative gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search..."
                className="w-60 bg-input border-border/50 shadow-sm shadow-border/60 rounded-full h-12 pl-11 pr-5"
              />
            </div>
            <button className="header-add w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300 cursor-pointer">
              <Plus
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <button className="header-notifications w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300 cursor-pointer">
              <Bell
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <button className="header-account w-13 h-13 rounded-full bg-foreground/10 dark:bg-white/10 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-foreground/20 dark:hover:bg-white/20 hover:border-border/60 transition-all duration-300 cursor-pointer overflow-hidden">
              {user?.pfp ? (
                <img
                  src={user.pfp}
                  alt="Profile"
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <UserIcon
                  size={20}
                  className="text-foreground/60 dark:text-white/60 pointer-events-none"
                />
              )}
            </button>
          </div>
        </div>
        <div className="dashboard-content w-full h-full flex items-center justify-center pb-4 gap-4">
          <div className="dashboard-content-left bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-2/3 h-20" />
            <Skeleton className="w-full h-40" />
          </div>
          <div className="dashboard-content-right bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
            <Skeleton className="w-1/4 h-6" />
            <div className="flex gap-3">
              <Skeleton className="w-24 h-24 rounded-xl" />
              <Skeleton className="w-24 h-24 rounded-xl" />
              <Skeleton className="w-24 h-24 rounded-xl" />
            </div>
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-3/4 h-16" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
