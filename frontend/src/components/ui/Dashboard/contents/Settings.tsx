import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

import AccountSettings from "./settings/AccountSettings";
import AccountPreferences from "./settings/AccountPreferences";
import AppearanceSettings from "./settings/AppearanceSettings";
import PrivacyPolicy from "./settings/PrivacyPolicy";
import TermsOfService from "./settings/TermsOfService";
import ProfilePictureChange from "@components/ui/ProfilePictureChange";
import { Badge } from "@components/ui/badge";

import { useUser } from "@context/UserContext";

import {
  UserIcon,
  UserRoundCog,
  Pen,
  ChevronRight,
  ForkKnife,
  Paintbrush,
  Shield,
  Users2,
} from "lucide-react";

type settingTabs =
  | "account"
  | "preferences"
  | "appearance"
  | "privacy"
  | "terms";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded-lg ${className || ""}`}
    />
  );
}
export function SettingsTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Settings</h1>;
}

export function SettingsContent() {
  const { user, refetchUser, loading } = useUser();

  const [busy, setbusy] = useState(true);
  const [selectedSetting, setSelectedSetting] = useState(
    null as settingTabs | null,
  );
  const [pfpChangeOpen, setPfpChangeOpen] = useState(false);

  const Settings: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }> = [
    {
      id: "account",
      title: "Account Settings",
      icon: <UserRoundCog size={20} className="" />,
      content: <AccountSettings />,
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: <ForkKnife size={20} className="" />,
      content: <AccountPreferences />,
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <Paintbrush size={20} className="" />,
      content: <AppearanceSettings />,
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: <Shield size={20} className="" />,
      content: <PrivacyPolicy />,
    },
    {
      id: "terms",
      title: "Terms of Service",
      icon: <Users2 size={20} className="" />,
      content: <TermsOfService />,
    },
  ];

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.hash.replace("#", "").split("?")[1],
    );
    const setting = params.get("setting") as settingTabs | null;

    console.log("received setting: ", setting, params);

    if (
      setting &&
      Settings.some((s) => s.id === setting.toLowerCase().trim())
    ) {
      setSelectedSetting(setting);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      setbusy(false);
    }
  }, [loading, user]);

  const setProfilePicture = async (pfp: string) => {
    const loadingToast = toast.loading("Saving changes...");

    try {
      const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

      await axios.put(
        `${BASE_API_URL}/user/profile`,
        {
          pfp,
          isCustomized: true,
        },
        { withCredentials: true },
      );

      refetchUser();

      toast.dismiss(loadingToast);
      toast.success("Account updated successfully!");
    } catch (err: unknown) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data?.message || "Failed to save profile");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="settings-content w-full h-full shrink relative flex items-center justify-center pb-4 gap-4 px-12">
      <AnimatePresence>
        <motion.div
          className={`settings-content-left bg-card/50 border border-border/50 w-130 h-full transition-all duration-700 ease-out flex flex-col relative rounded-2xl p-5 gap-4`}
        >
          {busy ? (
            <>
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-12 mt-7" />
              <Skeleton className="w-full h-12 mt-3" />
              <Skeleton className="w-full h-12 mt-3" />
              <Skeleton className="w-full h-12 mt-3" />
              <Skeleton className="w-full h-12 mt-3" />
              <Skeleton className="w-full h-12 mt-3" />
              <Skeleton className="w-full h-12 mt-3" />
            </>
          ) : (
            <>
              <motion.div
                layout
                initial={false}
                animate={{
                  height: pfpChangeOpen ? "100%" : "auto",
                  width: pfpChangeOpen ? "100%" : "auto",
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="relative flex items-center justify-center"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {pfpChangeOpen ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pfp-change-tab py-10 w-full h-full bg-linear-to-br from-muted to-primary/30 flex flex-col gap-2 items-center justify-center rounded-2xl shadow-sm shadow-border"
                    >
                      <ProfilePictureChange
                        initialPicture={user?.pfp}
                        onLoad={setProfilePicture}
                        onClose={() => setPfpChangeOpen(false)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="account-tab py-10 w-full  bg-linear-to-br from-muted to-primary/30 flex flex-col gap-2 items-center justify-center rounded-2xl shadow-sm shadow-border"
                    >
                      <div className="account-pfp w-25 h-25 rounded-full p-1 flex items-center justify-center relative border-accent/60 border-3 shadow-sm shadow-border/30 hover:bg-foreground/20 hover:border-border/60 transition-all duration-300 pointer-events-none">
                        {user?.pfp ? (
                          <img
                            src={user?.pfp}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full overflow-hidden pointer-events-none"
                          />
                        ) : (
                          <UserIcon
                            size={20}
                            className="text-foreground/60 pointer-events-none"
                          />
                        )}

                        <div className="modify-btn-overlay w-7 h-10 rotate-45 pointer-events-none rounded-full bg-linear-to-tl from-primary/80 to-primary/60 hover:bg-primary absolute -bottom-1 -right-1 flex items-center justify-center z-1">
                          <button
                            onClick={() => setPfpChangeOpen(true)}
                            className="w-7 h-10 rounded-full hover:-rotate-45 cursor-pointer transition-all duration-300 ease-out-cubic flex items-center justify-center pointer-events-auto relative z-2"
                          >
                            <Pen
                              size={14}
                              className="-rotate-30 pointer-events-none"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="account-details w-full flex items-center justify-center flex-col gap-0">
                        <span className="text-lg font-bold text-foreground text-center m-0 p-0">
                          {user?.name || "Unknown User"}
                        </span>
                        <span className="text-sm text-foreground/50 brightness-150">
                          {user?.email || "Email not available"}
                        </span>
                        <Badge className="login-badge flex px-2 py-1 mt-2 bg-destructive/30 border shadow-sm shadow-background font-bold tracking-wide text-foreground/70 text-[.65rem]">
                          {user?.createdAt
                            ? `Created on ${new Date(user?.createdAt).toLocaleDateString()}`
                            : "Creation date unknown"}
                        </Badge>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="settings-options w-full bg-linear-to-tr from-muted/70 to-primary/30 shadow-sm shadow-border flex flex-col items-center justify-center gap-.5 rounded-2xl relative">
                {Settings.map((setting, index) => (
                  <button
                    key={setting.id}
                    className={`setting-option h-15 w-full flex items-center justify-between px-6 py-2 pointer-events-auto rounded-none ${index === 0 ? "rounded-t-2xl" : index === Settings.length - 1 ? "rounded-b-2xl" : ""} hover:bg-accent/5 border-l-5 ${setting.id === selectedSetting ? "border-destructive text-destructive brightness-125 font-bold" : "border-destructive/0 text-foreground/80"} transition-all duration-200 cursor-pointer`}
                    onClick={() =>
                      setSelectedSetting(setting.id as settingTabs)
                    }
                  >
                    <div className="h-full flex items-center justify-center relative pointer-events-none">
                      {setting.icon && (
                        <div className="setting-icon mr-3 pointer-events-none">
                          {setting.icon}
                        </div>
                      )}
                      <span className="setting-title text-sm pointer-events-none">
                        {setting.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`${setting.id === selectedSetting ? "mr-1" : ""} transition-all duration-300 ease-out-cubic`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="settings-content-right bg-card/50 border border-border/50 w-full h-full flex flex-col relative rounded-2xl p-5 gap-4">
        {busy ? (
          <>
            <Skeleton className="w-1/3 h-14 mb-10" />
            <div className="flex gap-6 mb-5">
              <Skeleton className="w-40 h-32 rounded-xl" />
              <Skeleton className="w-40 h-32 rounded-xl" />
              <Skeleton className="w-40 h-32 rounded-xl" />
            </div>
            <Skeleton className="w-1/3 h-13 mb-5" />
            <Skeleton className="w-1/3 h-13 mb-5" />
            <Skeleton className="w-1/3 h-13 mb-5" />
            <Skeleton className="w-1/3 h-13 mb-5" />
            <Skeleton className="w-1/2 h-13" />
          </>
        ) : (
          <AnimatePresence mode="wait">
            {Settings.map((setting) =>
              setting.id === selectedSetting ? (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-200 flex overflow-y-scroll scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
                >
                  {setting.content}
                </motion.div>
              ) : null,
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
