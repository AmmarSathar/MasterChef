import { useState, useEffect, useRef, useCallback } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import SearchModal from "./SearchModal";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@context/UserContext";

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
  const userCardRef = useRef<HTMLDivElement>(null);
  const { user, logout, loading } = useUser();
  const [lastPage, setLastPage] = useState<string>("/");
  const [userPressed, setUserPressed] = useState(false);
  const [activeDashboard, setActiveDashboard] =
    useState<DashboardRouteKey>("main");
  const [searchOpen, setSearchOpen] = useState(false);

  const ActiveTitle = dashboardRoutes[activeDashboard].Title;
  const ActiveContent = dashboardRoutes[activeDashboard].Content;

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    // if you remove this check, it freaks out because user isn't loaded
    if(loading) {
      console.log("Loading user data...");
      return;
    }

    if (!user) {
      console.log("User is false!!!")
      navigate("/login");
      return;
    }
    
    if (!user.isCustomized) {
      toast.error("An error has occured, please login again.");
      // logout();
      navigate("/login");
      return;
    }

    const storedLastPage = localStorage.getItem("lastPage");
    if (storedLastPage) {
      setLastPage(storedLastPage);
    }
  }, [navigate, user, logout, loading]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userCardRef.current &&
        !userCardRef.current.contains(event.target as Node)
      ) {
        setUserPressed(false);
      }
    };

    if (userPressed) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userPressed]);

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
        <div className="dashboard-header w-full h-40 flex justify-between items-center p-1 px-3 relative">
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
            <button
              onClick={openSearch}
              className="relative flex items-center w-60 h-12 bg-input border border-border/50 shadow-sm shadow-border/60 rounded-full pl-4 pr-3 gap-3 text-left hover:bg-input/80 hover:border-border/70 transition-all duration-200 cursor-pointer group"
            >
              <Search
                size={16}
                className="text-muted-foreground shrink-0 group-hover:text-foreground/60 transition-colors"
              />
              <span className="flex-1 text-sm text-muted-foreground truncate">
                Search...
              </span>
              <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-border/40 bg-secondary/60 text-[11px] text-muted-foreground select-none shrink-0">
                <span className="font-sans">Ctrl</span>
                <span className="mx-0.5 opacity-60">+</span>
                <span className="font-sans">K</span>
              </div>
            </button>
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
                ref={userCardRef}
                initial={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, y: 0, backdropFilter: "blur(4px)" }}
                exit={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.2 }}
                tabIndex={0}
                className="user-card absolute pointer-events-auto w-80 min-h-100 py-10 bg-linear-to-br from-primary/30 via-primary/20 to-background z-80 rounded-2xl top-40 right-0 shadow-lg shadow-border/50 border-border/70 border-2 p-3 flex flex-col items-center justify-center gap-2"
              >
                <div className="user-pfp relative flex w-30 h-30 mb-2 rounded-full overflow-hidden border-3 border-ring shadow-lg shadow-ring/80 items-center justify-center bg-linear-to-tr from-ring to-secondary">
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
                    {user?.skill_level
                      ?.charAt(0)
                      .toUpperCase()
                      .concat(user?.skill_level.substring(1)) || "Beginner"}
                  </span>
                </div>

                <div className="user-description relative flex w-full max-h-30 items-center justify-center px-9 mt-2">
                  <div className="relative w-full h-full flex py-4 items-center justify-center shadow-lg shadow-primary/10 rounded-xl bg-linear-to-br from-secondary/20 to-secondary/10 ring-1 ring-secondary/30">
                    <span className="text-center text-md text-foreground/80 line-clamp-2 max-w-60">
                      {user?.bio ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip "}
                    </span>
                  </div>
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
                        logout();
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
            className="w-full h-full overflow-hidden relative"
          >
            <ActiveContent />
          </motion.div>
        </AnimatePresence>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.div>
  );
}
