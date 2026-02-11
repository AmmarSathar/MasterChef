import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import Ribbons from "@/components/Ribbons";

import Navbar from "@/components/ui/Navbar/Navbar";
import Home from "@/pages/Home/Home";
import Login from "./components/ui/Login/login";
import Dashboard from "@/components/ui/Dashboard/dashboard";

import { useBrandCursors } from "@/hooks/useBrandCursors";

export default function App() {
  // Inject theme-aware custom cursors (auto-updates on light/dark toggle)
  useBrandCursors();

  return (
    <BrowserRouter>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100vh",
            position: "relative",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          {/* <Ribbons
            baseThickness={80}
            colors={['#d7c7e7', '#ffdab9']}
            speedMultiplier={0.2}
            maxAge={300}
            enableFade={true}
            enableShaderEffect={true}
            effectAmplitude={0.3}
          /> */}
        </div>
      </div>
      <div className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden relative">
        <Navbar />
        <Toaster position="bottom-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
