import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@context/UserContext";
import { Recipe } from "@masterchef/shared";

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
import { RecipeTitle, RecipeContent } from "./contents/RecipeForm";
import { MealsTitle, MealsContent } from "./contents/Meals";
import { CalendarTitle, CalendarContent } from "./contents/Calendar";
import SearchContainer from "./SearchModal";

type DashboardRouteKey = "main" | "settings" | "meals" | "recipe" | "calendar";

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
  meals: {
    Title: MealsTitle,
    Content: MealsContent,
  },
  recipe: {
    Title: RecipeTitle,
    Content: RecipeContent,
  },
  calendar: {
    Title: CalendarTitle,
    Content: CalendarContent,
  },
}; 

export default function Dashboard() {
  const navigate = useNavigate();
  const userCardRef = useRef<HTMLDivElement>(null);
  const { user, logout, loading } = useUser();
  const [lastPage, setLastPage] = useState<string>("/");
  const [userPressed, setUserPressed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDashboard, setActiveDashboard] =
    useState<DashboardRouteKey>("main");

  const ActiveTitle = dashboardRoutes[activeDashboard].Title;
  const ActiveContent = dashboardRoutes[activeDashboard].Content;

  const parseHashRoute = (hashValue: string): DashboardRouteKey => {
    const raw = hashValue.startsWith("#") ? hashValue.slice(1) : hashValue;
    const route = raw.split("?")[0];
    if (route === "main" || route === "settings" || route === "recipe" || route === "meals" || route === "calendar")
      return route as DashboardRouteKey;

    console.log("passed there")
    return "main";
  };

  useEffect(() => {
    // if you remove this check, it freaks out because user isn't loaded
    if (loading) {
      console.log("Loading user data...");
      return;
    }

    if (!user) {
      console.log("User is false!!!");
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
    setActiveDashboard(parseHashRoute(window.location.hash));

    const handleHashChange = () => {
      setActiveDashboard(parseHashRoute(window.location.hash));
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDashboardChange = (dashboard: DashboardRouteKey) => {
    setActiveDashboard(dashboard);
    if (parseHashRoute(window.location.hash) !== dashboard) {
      window.location.hash = dashboard;
    } else if (window.location.hash !== `#${dashboard}`) {
      window.location.hash = dashboard;
    }
    setUserPressed(false);
  };

  const handleSearchClose = (recipe?: Recipe) => {
    setSearchOpen(false);

    if (!recipe) return;

    const goToRecipe = () => {
      if (window.location.pathname !== "/dashboard") {
        navigate("/dashboard");
      }
      window.location.hash = `recipe?id=${encodeURIComponent(recipe.id)}`;
    };

    setTimeout(goToRecipe, 150);
  };

  return (
    <motion.div
      className="dashboard-parent-container w-full h-screen flex relative justify-center items-center p-3 m-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dashboard-container w-full h-full bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-0 px-5 ml-25 gap-5 max-md:px-3 relative max-md:h-auto max-md:py-5 max-md:ml-0">
        <div className="dashboard-header w-full h-40 flex justify-between items-center p-1 px-3 relative">
          <div className="dashboard-header-left w-full h-full flex items-center justify-baseline relative gap-4">
            <button
              onClick={() => {
                if (activeDashboard === "settings" || activeDashboard === "meals" || activeDashboard === "recipe" || activeDashboard === "calendar") {
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
            <div
              className="search-button relative flex items-center justify-center pointer-events-auto cursor-pointer text-muted-foreground/70 font-semibold hover:text-muted-foreground/90 hover:brightness-110 transition-all duration-300 "
              onClick={() => setSearchOpen(true)}
            >
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <div className="w-60 bg-input border-border/50 shadow-sm shadow-border/60 rounded-full h-12 pl-11 pr-5 pointer-events-none flex items-center justify-between">
                <span className="text-sm text-muted-foreground pointer-events-none font-semibold font-body">
                  Search...
                </span>
                <div className="flex justify-center items-center relative gap-1.5 text-sm tracking-wider select-none px-1">
                  <kbd className="px-2 py-1 rounded-md ring-2 ring-border bg-background/60">
                    Ctrl
                  </kbd>
                  <kbd className="px-2 py-1 rounded-md ring-2 ring-border bg-background/60">
                    K
                  </kbd>
                </div>
              </div>
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
                ref={userCardRef}
                initial={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, y: 0, backdropFilter: "blur(7px)" }}
                exit={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.2 }}
                tabIndex={0}
                className="user-card absolute pointer-events-auto w-90 min-h-100 py-10 bg-linear-to-br from-primary/60 via-primary/50 to-background z-80 rounded-4xl top-40 right-0 shadow-lg shadow-border/50 border-border/70 border-2 p-3 flex flex-col items-center justify-center gap-2"
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
                    {user?.skill_level
                      ?.charAt(0)
                      .toUpperCase()
                      .concat(user?.skill_level.substring(1)) || "Beginner"}
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

        {createPortal(
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, y: 0, backdropFilter: "blur(2px)" }}
                exit={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.2 }}
                className="search-modal fixed pointer-events-auto inset-0 w-screen h-screen bg-background/60 z-55 flex items-center justify-center p-5"
              >
                <SearchContainer onClose={handleSearchClose} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </motion.div>
  );
}
