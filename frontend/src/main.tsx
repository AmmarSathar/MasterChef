import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { preloadCursors } from "./lib/preloadCursors";
import { UserProvider } from "./context/UserContext";

const savedTheme = localStorage.getItem("theme");
if (savedTheme && savedTheme !== "system") {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

preloadCursors();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
);
