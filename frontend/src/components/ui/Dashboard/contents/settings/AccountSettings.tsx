import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "@context/UserContext";

import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmChanges from "./ConfirmChanges";

import { UserPen, Shield } from "lucide-react";

export default function AccountSettings() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [age, setAge] = useState(user?.age);
  const [bio, setBio] = useState(user?.bio || undefined);

  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [showConfirm, showConfirmChanges] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (
      name !== user.name ||
      email !== user.email ||
      age !== user.age ||
      (bio !== user.bio && (user.bio || bio))
    ) {
      console.log(
        "USER: ",
        user.name,
        user.email,
        user.age,
        user.bio,
        "\n\nDATA:",
        name,
        email,
        age,
        bio,
      );
      showConfirmChanges(true);
    } else {
      showConfirmChanges(false);
    }
  }, [name, email, age, bio, user]);

  const onSettingsSubmit = async () => {
    setFormDisabled(true);

    const loadingToast = toast.loading("Saving changes...");

    const profilePayload = {
      userId: user?.id,
      name: name,
      email: email,
      age: age,
      bio: bio,
      isCustomized: true,
    };

    try {
      const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
      const res = await axios.put(
        `${BASE_API_URL}/auth/profile`,
        profilePayload,
      );
      const updatedUser = res.data.user;

      setUser(updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Successfully saved\nLet's start cooking!");

      setTimeout(() => {
        if (window.location.hash === "#settings") {
          window.location.hash = "main";
          setTimeout(() => (window.location.hash = "#settings"), 300);
        } else {
          window.location.hash = "#settings";
        }
      }, 200);

      setFormDisabled(false);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        const message =
          err?.response?.data?.message ||
          "Failed to save profile. Please try again.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      setFormDisabled(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log(
          "Data to parse: ",
          name,
          email,
          age,
          bio,
          "\n\n Into: ",
          user,
        );

        onSettingsSubmit();
      }}
      onReset={() => showConfirmChanges(false)}
      className="account-settings w-full h-auto flex flex-col gap-20 items-center justify-start p-5 py-6 relative"
    >
      <div className="option-group w-full py-3 flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-1">
            <label className="pointer-events-none select-none text-xl text-left font-bold text-accent">
              Account Settings
            </label>
            <p className="text-muted-foreground text-sm">
              Manage your account information
            </p>
          </div>
          <div className="flex gap-2 items-center justify-baseline w-full">
            <UserPen size={20} className="text-accent/80" />

            <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
              Personal Information
            </label>
          </div>
        </div>

        <div className="flex gap-6 w-full items-center justify-center">
          <div className="flex flex-col gap-5 w-2/3 h-full items-center justify-between">
            <div className="input-name flex flex-col gap-3 w-full relative">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Full Name
              </label>
              <Input
                type="text"
                name="user-name"
                disabled={formDisabled}
                onChange={(event) => {
                  const value = event.target.value;
                  setName(value || user?.name);
                }}
                placeholder={user?.name || ""}
                className="bg-input/80 rounded-xl px-4 py-1 h-14 w-full"
              />
            </div>
            <div className="input-email flex flex-col gap-3 w-full relative">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Email Address
              </label>
              <Input
                type="email"
                name="user-email"
                disabled={formDisabled}
                onChange={(event) => {
                  const value = event.target.value;
                  setEmail(value || user?.email);
                }}
                placeholder={user?.email || ""}
                className="bg-input/80 rounded-xl px-4 py-1 h-14 w-full"
              />
            </div>
            <div className="input-age flex flex-col gap-3 w-full relative">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Age
              </label>
              <Input
                type="number"
                name="user-age"
                disabled={formDisabled}
                onChange={(event) => {
                  const value = event.target.value;
                  setAge(Number(value) || user?.age);
                }}
                placeholder={`${user?.age || "No age set"}`}
                className="bg-input/80 rounded-xl px-4 py-1 h-14 w-full"
              />
            </div>
          </div>
          <div className="input-bio flex flex-col gap-3 w-full h-full relative">
            <div className="flex w-full items-baseline ml-1 justify-center flex-col gap-1">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Bio
              </label>
              <p className="text-muted-foreground text-sm">
                This info will only be seen in your profile
              </p>
            </div>

            <Textarea
              color="var(--input-hex)"
              name="user-bio"
              onChange={(event) => {
                const value = event.target.value;
                setBio(value || user?.bio || "");
              }}
              placeholder={user?.bio || "What makes you special?"}
              className="bg-input/80 rounded-xl px-4 py-3 h-full w-full resize-none"
            />
          </div>
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex gap-2 items-center justify-baseline w-full">
          <Shield size={20} className="text-accent/80" />

          <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
            Account Security
          </label>
        </div>
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full flex items-center justify-between px-8 py-6 bg-linear-to-br from-secondary/5 to-secondary/60 border border-border/70 rounded-t-2xl">
            <div className="flex flex-col h-full gap-1 items-start justify-center">
              <span className="text-foreground/80 text-sm font-semibold tracking-wide text-left">
                Change Password
              </span>
              <p className="text-muted-foreground/50 text-xs text-left">
                {user?.updatedAt
                  ? `Last changed ${new Date(user?.updatedAt).toLocaleDateString()}`
                  : "No password set"}
              </p>
            </div>

            <button
              type="button"
              disabled={formDisabled}
              className="bg-linear-to-br from-input to-input/60 shadow-sm shadow-input/30 px-5 py-3 hover:from-destructive/50 hover:to-destructive/20 text-sm rounded-lg transition-colors duration-300"
            >
              Update
            </button>
          </div>

          <div className="w-full flex items-center justify-between px-8 py-6 bg-linear-to-br from-secondary/5 to-secondary/60 border border-border/70 rounded-b-2xl">
            <div className="flex flex-col h-full gap-1 items-start justify-center">
              <span className="text-foreground/80 text-sm font-semibold tracking-wide text-left">
                Setup 2FA
              </span>
            </div>

            <button
              type="button"
              disabled
              className="bg-linear-to-br from-input to-input/60 shadow-sm shadow-input/30 px-5 py-3 hover:from-foreground/10 hover:to-foreground/5 text-sm rounded-lg transition-colors duration-300"
            >
              Unavailable
            </button>
          </div>
        </div>
      </div>

      <div className="danger-zone option-group py-6 pb-7 mb-10 flex flex-col justify-center items-baseline gap-4 px-7 bg-linear-to-br from-destructive/10 to-destructive/5 border-destructive/10 border-2 rounded-2xl w-full">
        <div className="flex flex-col gap-2 items-baseline justify-center">
          <label className="pointer-events-none text-lg text-left font-extrabold tracking-wide text-destructive brightness-150">
            Danger Zone
          </label>
          <p className="text-destructive brightness-110 text-sm text-left font-semibold">
            Once deleted, this action cannot be undone
          </p>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasUnderstood}
              className="w-5 h-5 rounded-full"
              style={{
                borderColor: "var(--destructive-hex)",
              }}
              onCheckedChange={(checked) => {
                const value = checked.valueOf();
                setHasUnderstood(value === true);
              }}
            />
            <span className="text-destructive brightness-110 text-sm text-left font-semibold">
              I understand the consequences of this action
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!hasUnderstood || formDisabled}
          className="bg-none text-destructive brightness-150 font-extrabold cursor-pointer mt-3"
        >
          <span className="pointer-events-none select-none underline underline-offset-4 transition-colors duration-300">
            Delete Account
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, y: 0, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, y: 10, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="fixed w-full h-auto flex items-center justify-center bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-10"
          >
            <ConfirmChanges />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
