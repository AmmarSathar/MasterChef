import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Toaster} from "react-hot-toast";

import Navbar from "@/components/ui/Navbar/Navbar";
import Home from "@/pages/Home/Home";
import Login from "./components/ui/Login/login";

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden">
        <Navbar />
        <Toaster position="bottom-center"/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
