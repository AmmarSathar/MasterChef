import React, { useEffect } from "react";
import {
  Utensils,
  LayoutGrid,
  Calendar,
  FileText,
  Tv,
  BarChart3,
  Settings,
  LogOut,
  MoreHorizontal,
  UtensilsCrossed,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import "./styles.css";
import { useNavigate, useLocation } from "react-router-dom";

import { useUser } from "@/context/UserContext";

type dashboardLocations =
  | "nav-main"
  | "nav-meals"
  | "nav-recipes"
  | "nav-settings"
  | "nav-calendar";

export default function Navbar() {
  const { user, logout } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedBtn, setSelectedBtn] =
    React.useState<dashboardLocations>("nav-main");
  const [isMoreOpen, setIsMoreOpen] = React.useState<boolean>(false);
  const [showMoreButton, setShowMoreButton] = React.useState<boolean>(false);

  const [userConnected, setUserConnected] = React.useState<boolean>(false);

  useEffect(() => {
    setUserConnected(!!user);
  }, [user]);

  useEffect(() => {
    const currentUrl = window.location.href;
    const [restOfUrl, hash] = currentUrl.split("#");

    if (!hash) return;

    const path = restOfUrl.split("/").pop();
    const convertedDashboardInstance: dashboardLocations = [
      "nav-main",
      "nav-meals",
      "nav-recipes",
      "nav-settings",
      "nav-calendar",
    ].filter((val) => val.includes(hash.toLowerCase().split("?")[0]))[0] as dashboardLocations;

    if (path === "dashboard") {
      setSelectedBtn(convertedDashboardInstance || "nav-main");
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setShowMoreButton(window.innerHeight < 700);
      if (window.innerHeight >= 700) {
        setIsMoreOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToDashboardPage = (
    e: React.MouseEvent,
    hash: string,
    verifyConnexion: boolean,
  ) => {
    if (!userConnected && verifyConnexion) {
      navigate("/login");
      return;
    }

    const btnLabel = e.currentTarget.ariaLabel as
      | "Dashboard"
      | "Calendar"
      | "Recipes"
      | "Meals"
      | "Settings";

    const buttonMap: Record<
      "Dashboard" | "Calendar" | "Recipes" | "Meals" | "Settings",
      dashboardLocations
    > = {
      Dashboard: "nav-main",
      Calendar: "nav-calendar",
      Recipes: "nav-recipes",
      Meals: "nav-meals",
      Settings: "nav-settings",
    };

    if (window.location.pathname !== "/dashboard") {
      navigate(`/dashboard#${hash}`);
    } else {
      window.location.hash = hash;
    }
    setSelectedBtn(buttonMap[btnLabel]);
    setIsMoreOpen(false);
  };

  const logoutUser = () => {
    setIsMoreOpen(false);

    if (user) {
      if (location.pathname === "/login") {
        navigate("/");
      } else {
        navigate("/login");
      }
    }

    setSelectedBtn("nav-main");
    logout();
  };

  return (
    <div className="navbar-parent-container w-screen h-screen min-h-155 flex items-center justify-baseline pointer-events-none absolute top-0 left-0 transition-all duration-1000 ease-out-expo">
      <nav className="md:h-full w-30 max-md:w-screen max-md:hidden max-md:h-10 flex relative max-md:left-0 max-md:my-10 max-md:mx-0 items-center pointer-events-auto justify-center p-3 m-0 text-foreground z-50">
        <div className="w-full h-full py-8 p-4 pointer-events-auto transition-all duration-400 delay-100 ease-out bg-card/70 hover:bg-card rounded-3xl flex flex-col items-center justify-between gap-3 relative shadow-xl border border-border">
          <div className="flex flex-col items-center gap-3 z-20">
            <div className="flex w-13 h-13 bg-secondary items-center justify-center rounded-full shadow-lg shadow-secondary/30">
              <Utensils className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 flex-1 justify-center z-20">
            <button
              onClick={(e) => goToDashboardPage(e, "main", true)}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-main"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutGrid
                className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-main" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-main" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Home
              </span>
            </button>

            {!showMoreButton && (
              <>
                <button
                  disabled={!userConnected}
                  onClick={(e) => goToDashboardPage(e, "calendar", true)}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-calendar"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Calendar"
                  aria-label="Calendar"
                >
                  <Calendar
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-calendar" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-calendar" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Calendar
                  </span>
                </button>

                <button
                  disabled={!userConnected}
                  onClick={(e) => goToDashboardPage(e, "recipe", true)}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-recipes"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Recipes"
                  aria-label="Recipes"
                >
                  <FileText
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-recipes" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-recipes" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Recipes
                  </span>
                </button>
                <button
                  disabled={!userConnected}
                  onClick={(e) => goToDashboardPage(e, "meals", true)}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-meals"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Meals"
                  aria-label="Meals"
                >
                  <UtensilsCrossed
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-meals" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-meals" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Meals
                  </span>
                </button>

                {/* <button
                  disabled={!userConnected}
                  onClick={() => {
                    setSelectedBtn("nav-tv");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-tv"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Media"
                  aria-label="Media"
                >
                  <Tv
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Media
                  </span>
                </button> */}

                {/* <button
                  onClick={() => {
                    setSelectedBtn("nav-idk");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-idk"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Analytics"
                  aria-label="Analytics"
                >
                  <BarChart3
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Stats
                  </span>
                </button> */}
              </>
            )}

            {showMoreButton && (
              <>
                <button
                  disabled={!userConnected}
                  onClick={() => {
                    setSelectedBtn("nav-calendar");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-calendar"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="Calendar"
                  aria-label="Calendar"
                >
                  <Calendar
                    className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-calendar" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-calendar" ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    Calendar
                  </span>
                </button>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                    isMoreOpen
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                  title="More"
                  aria-label="More"
                >
                  <MoreHorizontal
                    className={`w-5 h-5 pointer-events-none ${isMoreOpen ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-[9px] leading-none pointer-events-none ${isMoreOpen ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    More
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 z-20">
            <button
              onClick={(e) => goToDashboardPage(e, "settings", true)}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-settings"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings
                className={`w-5 h-5 pointer-events-none ${selectedBtn === "nav-settings" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-settings" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Settings
              </span>
            </button>
            <div className="flex w-12 h-12 items-center justify-center">
              <ThemeToggle />
            </div>
            <button
              onClick={logoutUser}
              disabled={false}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 bg-secondary hover:bg-muted`}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-muted-foreground pointer-events-none" />
              <span className="text-[9px] leading-none text-muted-foreground pointer-events-none">
                Logout
              </span>
            </button>
          </div>
        </div>

        <div
          className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
            isMoreOpen && showMoreButton
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
        >
          <div className="py-8 p-4 bg-card/70 backdrop-blur-sm rounded-3xl flex flex-col items-center gap-6 shadow-xl border border-border">
            <button
              disabled={!userConnected}
              onClick={(e) => goToDashboardPage(e, "recipe", true)}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-recipes"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Recipes"
              aria-label="Recipes"
            >
              <FileText
                className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-recipes" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-recipes" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Recipes
              </span>
            </button>
            <button
              disabled={!userConnected}
              onClick={(e) => goToDashboardPage(e, "meals", true)}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-meals"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Meals"
              aria-label="Meals"
            >
              <UtensilsCrossed
                className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-meals" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-meals" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Meals
              </span>
            </button>

            {/* <button
              disabled={!userConnected}
              onClick={() => {
                setSelectedBtn("nav-tv");
              }}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-tv"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Media"
              aria-label="Media"
            >
              <Tv
                className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Media
              </span>
            </button> */}

            {/* <button
              onClick={() => {
                setSelectedBtn("nav-idk");
              }}
              className={`flex w-12 h-15 flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-idk"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
              title="Analytics"
              aria-label="Analytics"
            >
              <BarChart3
                className={`w-5 h-5 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] leading-none pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                Stats
              </span>
            </button> */}
          </div>
        </div>
      </nav>
    </div>
  );
}
