import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Navbar from "@/components/ui/Navbar/Navbar";
import Home from "@/pages/Home/Home";
import Login from "./components/ui/Login/login";
import Dashboard from "@/components/ui/Dashboard/dashboard";

export default function App() {

  return (
    <BrowserRouter>
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
