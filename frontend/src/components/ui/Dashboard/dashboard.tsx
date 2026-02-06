import { useState, useEffect } from "react";

import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { User } from "@masterchef/shared/types/user";

export default function Dashboard() {
  const [user, setUser] = useState<User>({} as User);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [user]);

  return (
    <div className="dashboard-parent-container w-full h-screen flex relative justify-center items-center p-3 m-0">
      <div className="dashboard-container w-full h-full bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-0 px-5 ml-25 gap-5">
        <div className="dashboard-header w-full bg-card/80 h-40 flex justify-between items-center p-1">
          <div className="dashboard-header-left w-full h-full flex items-center justify-baseline relative gap-4">
            <button className="header-return w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300">
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <span className="text-xl font-bold text-accent/80">Dashboard</span>
          </div>
          <div className="dashboard-header-right w-full h-full flex items-center justify-end relative gap-4">
            <Input
              placeholder="Search..."
              className="w-60 bg-input border-border/50 shadow-sm shadow-border/60 rounded-full h-12 px-5"
            />
            <button className="header-add w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300">
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <button className="header-notifications w-12 h-12 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300">
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
            <button className="header-account w-13 h-13 rounded-full bg-input/80 flex items-center justify-center relative border-border/40 border-2 shadow-sm shadow-border/30 hover:bg-input hover:border-border/60 transition-all duration-300">
              <ArrowLeft
                size={20}
                className="text-accent/60 pointer-events-none"
              />
            </button>
          </div>
        </div>
        <div className="dashboard-content w-full h-full flex items-center justify-center pb-4 gap-4">
          <div className="dashbaord-content-left bg-accent/80 w-1/2 h-full flex flex-col relative rounded-2xl"></div>
          <div className="dashbaord-content-right bg-secondary/80 w-1/2 h-full flex flex-col relative rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
