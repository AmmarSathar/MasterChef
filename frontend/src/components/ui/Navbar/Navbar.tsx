import React from "react";
import {
  Utensils,
  LayoutGrid,
  Bookmark,
  FileText,
  Tv,
  BarChart3,
  Settings,
  LogOut,
  MoreHorizontal,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import "./styles.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const [selectedBtn, setSelectedBtn] = React.useState<string>("");
  const [isMoreOpen, setIsMoreOpen] = React.useState<boolean>(false);
  const [showMoreButton, setShowMoreButton] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleResize = () => {
      setShowMoreButton(window.innerHeight < 700);
      if (window.innerHeight >= 700) {
        setIsMoreOpen(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="navbar-parent-container w-screen h-screen flex items-center justify-baseline pointer-events-none absolute top-0 left-0">
      <nav className="md:h-full w-30 max-md:w-screen max-md:hidden max-md:h-10 flex relative max-md:left-0 max-md:my-10 max-md:mx-0 items-center pointer-events-auto justify-center p-3 m-0 text-foreground z-50">
        <div className="w-full h-full py-8 p-4 pointer-events-auto transition-all duration-400 delay-100 ease-out bg-card/70 hover:bg-card rounded-3xl flex flex-col items-center justify-between gap-3 relative shadow-xl border border-border">
          <div className="flex flex-col items-center gap-3 z-20">
            <div className="flex w-13 h-13 bg-secondary items-center justify-center rounded-full shadow-lg shadow-secondary/30">
              <Utensils className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 flex-1 justify-center z-20">
            <button
              onClick={() => setSelectedBtn("nav-dashboard")}
              className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-dashboard" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-dashboard"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <LayoutGrid
                className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-dashboard" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
              />
            </button>

            {!showMoreButton && (
              <>
                <button
                  onClick={() => {
                    setSelectedBtn("nav-saved");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-saved" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-saved"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <Bookmark
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-saved" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>

                <button
                  onClick={() => {
                    setSelectedBtn("nav-upload");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-upload" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-upload"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <FileText
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-upload" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>

                <button
                  onClick={() => {
                    setSelectedBtn("nav-tv");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-tv" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-tv"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <Tv
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>

                <button
                  onClick={() => {
                    setSelectedBtn("nav-idk");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-idk" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-idk"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <BarChart3
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>
              </>
            )}

            {showMoreButton && (
              <>
                <button
                  onClick={() => {
                    setSelectedBtn("nav-saved");
                    setIsMoreOpen(false);
                  }}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-saved" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === "nav-saved"
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <Bookmark
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-saved" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer rounded-xl transition-all duration-300 ${
                    isMoreOpen
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <MoreHorizontal
                    className={`w-6 h-6 pointer-events-none ${isMoreOpen ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 z-20">
            <button
              onClick={() => setSelectedBtn("nav-settings")}
              className={`flex w-12 h-12 items-center justify-center cursor-pointer rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-settings"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <Settings
                className={`w-6 h-6 pointer-events-none ${selectedBtn === "nav-settings" ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
            </button>
            <div className="flex w-12 h-12 items-center justify-center">
              <ThemeToggle />
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setIsMoreOpen(false);
                navigate("/login");
              }}
              className="flex w-12 h-12 items-center justify-center cursor-pointer rounded-xl transition-all duration-300 bg-secondary hover:bg-muted"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-muted-foreground pointer-events-none" />
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
              onClick={() => {
                setSelectedBtn("nav-upload");
              }}
              className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-upload" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-upload"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <FileText
                className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-upload" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
              />
            </button>

            <button
              onClick={() => {
                setSelectedBtn("nav-tv");
              }}
              className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-tv" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-tv"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <Tv
                className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-tv" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
              />
            </button>

            <button
              onClick={() => {
                setSelectedBtn("nav-idk");
              }}
              className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === "nav-idk" ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                selectedBtn === "nav-idk"
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <BarChart3
                className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === "nav-idk" ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
              />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
