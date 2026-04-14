import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { Toaster } from "react-hot-toast";

import Navbar from "@/components/features/navbar/Navbar";
import Home from "@/pages/Home/Home";
import Login from "./components/features/login/login";
import Dashboard from "@/components/features/dashboard/dashboard";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden relative">
        <Navbar />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--primary-hex)",
              color: "var(--accent)",
              fontWeight: "bold",
            },
          }}
        />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
