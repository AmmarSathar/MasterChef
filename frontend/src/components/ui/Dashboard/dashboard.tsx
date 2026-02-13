import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  Plus,
  Bell,
  Search,
  UserIcon,
  Share2,
  LogOut,
  Settings,
  House,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { User } from "@masterchef/shared/types/user";
import toast from "react-hot-toast";
import {
  MainDashboardTitle,
  MainDashboardContent,
} from "./contents/DashboardMain";
import { SettingsTitle, SettingsContent } from "./contents/Settings";

type DashboardRouteKey = "main" | "settings";

const dashboardRoutes: Record<
  DashboardRouteKey,
  { Title: ComponentType; Content: ComponentType }
> = {
  main: {
    Title: MainDashboardTitle,
    Content: MainDashboardContent,
  },
  settings: {
    Title: SettingsTitle,
    Content: SettingsContent,
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [lastPage, setLastPage] = useState<string>("/");
  const [userPressed, setUserPressed] = useState(false);
  const [activeDashboard, setActiveDashboard] =
    useState<DashboardRouteKey>("main");

  const ActiveTitle = dashboardRoutes[activeDashboard].Title;
  const ActiveContent = dashboardRoutes[activeDashboard].Content;

  useEffect(() => {
    // For now, I plan to fetch {name, email, pfp} from local. idk if it's a good idea tho
    const storedUser = localStorage.getItem("user");
    // After further research, this is a VERY BAD IDEA, as it b64 text will easily bloat the LS
    // I'll implement IndexDB later to store the local user
    if (storedUser) {
      if (!JSON.parse(storedUser).isCustomized) {
        toast.error("An error has occured, please login again.");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
      return;
    }

    const storedLastPage = localStorage.getItem("lastPage");
    if (storedLastPage) {
      setLastPage(storedLastPage);
    }
  }, [navigate]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash === "main" || hash === "settings") {
      handleDashboardChange(hash as DashboardRouteKey);
    } else {
      handleDashboardChange("main");
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.substring(1);
      if (newHash === "main" || newHash === "settings") {
        handleDashboardChange(newHash as DashboardRouteKey);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleDashboardChange = (dashboard: DashboardRouteKey) => {
    setActiveDashboard(dashboard);
    window.location.hash = dashboard;
    setUserPressed(false);
  };

  return (
    <motion.div
      className="dashboard-parent-container w-full h-screen flex relative justify-center items-center p-3 m-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dashboard-container w-full h-full bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-0 px-5 ml-25 gap-5">
        <div className="dashboard-header w-full bg-card/80 h-40 flex justify-between items-center p-1 px-3 relative">
          <div className="dashboard-header-left w-full h-full flex items-center justify-baseline relative gap-4">
            <button
              onClick={() => {
                if (activeDashboard === "settings") {
                  handleDashboardChange("main");
                  return;
                } else if (activeDashboard === "main") {
                  navigate(lastPage);
                  return;
                }

                handleDashboardChange("main");
              }}
              className="header-return w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${activeDashboard}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center"
              >
                <ActiveTitle />
              </motion.div>
            </AnimatePresence>
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
              <Plus size={20} className="text-accent/60 pointer-events-none" />
            </button>
            <button className="header-notifications w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300 cursor-pointer">
              <Bell size={20} className="text-accent/60 pointer-events-none" />
            </button>
            <button
              onClick={() => setUserPressed(!userPressed)}
              className="header-account w-13 h-13 rounded-full bg-foreground/10 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-foreground/20 hover:border-border/60 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {user?.pfp ? (
                <img
                  src={user.pfp}
                  alt="Profile"
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <UserIcon
                  size={20}
                  className="text-foreground/60 pointer-events-none"
                />
              )}
            </button>
          </div>

          <AnimatePresence>
            {userPressed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="user-card absolute w-90 min-h-100 py-10 bg-linear-to-br from-primary/20 via-primary/10 to-background z-80 rounded-4xl top-40 right-0 shadow-lg shadow-border/50 border-border/70 border-2 p-3 flex flex-col items-center justify-center gap-2"
              >
                <div className="user-pfp relative flex w-30 h-30 rounded-full overflow-hidden border-3 border-ring shadow-sm shadow-ring/50 items-center justify-center bg-linear-to-tr from-ring to-secondary">
                  {user?.pfp ? (
                    <img
                      src={user.pfp}
                      alt="Profile"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <UserIcon
                      size={45}
                      className="text-foreground/60 pointer-events-none"
                    />
                  )}
                </div>

                <div className="user-details relative w-full flex flex-col items-center justify-center gap-1 p-1">
                  <span className="user-username font-bold text-3xl text-accent">
                    {user?.name || "Unknown User"}
                  </span>
                  <span className="user-cooking-level font-semibold text-sm text-foreground">
                    {user?.skill_level || "Beginner"}
                  </span>
                </div>

                <div className="user-description relative w-full flex items-center justify-center p-1 mt-2">
                  <span className="text-center text-sm text-foreground/80 line-clamp-2 max-w-60">
                    {user?.bio ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip "}
                  </span>
                </div>

                <div className="user-actions relative w-full flex flex-col items-center justify-center gap-5 p-1 mt-4">
                  <span className="user-email rounded-lg bg-linear-to-br from-grain1/40 to-grain3/80 shadow-lg shadow-border/40 border-border border-2 px-6 py-2 text-sm font-bold tracking-wide text-foreground/80 cursor-pointer hover:bg-grain2/50 transition-all duration-500">
                    {user?.email || "No email"}
                  </span>

                  <div className="user-options relative w-full flex items-center justify-center gap-3 mt-2">
                    <button
                      onClick={() => {
                        handleDashboardChange("main");
                      }}
                      className="w-10 h-10 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-300 text-sm font-semibold text-foreground flex items-center justify-center relative"
                      title="Dashboard"
                    >
                      <House size={18} className="pointer-events-none" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-300 text-sm font-semibold text-foreground flex items-center justify-center relative"
                      title="Share"
                    >
                      <Share2 size={18} className="pointer-events-none" />
                    </button>
                    <button
                      onClick={() => {
                        handleDashboardChange("settings");
                      }}
                      className="w-10 h-10 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-300 text-sm font-semibold text-foreground flex items-center justify-center relative"
                      title="Options"
                    >
                      <Settings size={18} className="pointer-events-none" />
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("user");
                        navigate("/login");
                      }}
                      className="w-10 h-10 rounded-lg bg-destructive/40 hover:bg-destructive/60 transition-all duration-300 text-sm font-semibold text-foreground flex items-center justify-center relative"
                      title="Logout"
                    >
                      <LogOut size={18} className="pointer-events-none" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeDashboard}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            <ActiveContent />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
