import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "@context/UserContext";
import { authClient } from "@/lib/auth-client";

import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmChanges from "./ConfirmChanges";

import { UserPen, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const PW_REQUIREMENTS = [
  { label: "At least 8 characters", validate: (p: string) => p.length >= 8 },
  {
    label: "Contains uppercase letter",
    validate: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: "Contains lowercase letter",
    validate: (p: string) => /[a-z]/.test(p),
  },
  { label: "Contains number", validate: (p: string) => /[0-9]/.test(p) },
  {
    label: "Contains special character",
    validate: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export default function AccountSettings() {
  const { user, refetchUser } = useUser();
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [age, setAge] = useState(user?.age);
  const [bio, setBio] = useState(user?.bio || undefined);

  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [showConfirm, showConfirmChanges] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null as string | null);
  const [formDisabled, setFormDisabled] = useState(false);

  // Password section state
  const [hasCredentialAccount, setHasCredentialAccount] = useState<
    boolean | null
  >(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCurrPw, setShowCurrPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pwReqs, setPwReqs] = useState(
    PW_REQUIREMENTS.map((r) => ({ ...r, complete: false })),
  );

  useEffect(() => {
    authClient.listAccounts().then(({ data }) => {
      if (data) {
        setHasCredentialAccount(
          data.some((a) => a.providerId === "credential"),
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (
      name !== user.name ||
      email !== user.email ||
      age !== user.age ||
      (bio !== user.bio && (user.bio || bio))
    ) {
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
      await axios.put(
        `${BASE_API_URL}/user/profile`,
        profilePayload,
        { withCredentials: true },
      );
      refetchUser();

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

  const onPasswordSubmit = async () => {
    if (!newPassword) return;
    const failing = pwReqs.find((r) => !r.complete);
    if (failing) {
      toast.error(failing.label);
      return;
    }

    setPasswordLoading(true);
    const loadingToast = toast.loading(
      hasCredentialAccount ? "Updating password..." : "Setting password...",
    );

    try {
      if (hasCredentialAccount) {
        // User already has a password → use BetterAuth's changePassword
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
        });
        if (error) {
          toast.dismiss(loadingToast);
          if (error.code === "INVALID_PASSWORD") {
            toast.error("Current password is incorrect.");
          } else {
            toast.error(error.message || "Failed to update password.");
          }
          return;
        }
      } else {
        // OAuth-only user → call our custom set-password endpoint
        const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
        await axios.post(
          `${BASE_API_URL}/user/set-password`,
          { newPassword },
          { withCredentials: true },
        );
        setHasCredentialAccount(true);
      }

      toast.dismiss(loadingToast);
      toast.success("Password updated successfully!");
      setShowPasswordForm(false);
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error === "PASSWORD_ALREADY_SET") {
          toast.error("A password is already set. Please use Change Password.");
          setHasCredentialAccount(true);
        } else {
          toast.error(
            err.response?.data?.message || "Failed to update password.",
          );
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const deleteUser = async () => {
    const loadingToast = toast.loading("Deleting account...");
    const { error } = await authClient.deleteUser();
    
    toast.dismiss(loadingToast);

    if (error) return toast.error(error.message || "Failed to delete account.");
    toast.success("Account deleted successfully.");
    setTimeout(() => (window.location.href = "/"), 1500);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
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
          <div className="w-full flex flex-col bg-linear-to-br from-secondary/5 to-secondary/60 border border-border/70 rounded-t-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex flex-col h-full gap-1 items-start justify-center">
                <span className="text-foreground/80 text-sm font-semibold tracking-wide text-left">
                  {hasCredentialAccount ? "Change Password" : "Set Password"}
                </span>
                <p className="text-muted-foreground/50 text-xs text-left">
                  {hasCredentialAccount
                    ? user?.updatedAt
                      ? `Last changed ${new Date(user.updatedAt).toLocaleDateString()}`
                      : "Password is set"
                    : "Add email/password sign-in to your account"}
                </p>
              </div>

              <button
                type="button"
                disabled={formDisabled || hasCredentialAccount === null}
                onClick={() => setShowPasswordForm((v) => !v)}
                className="bg-linear-to-br from-input to-input/60 shadow-sm shadow-input/30 px-5 py-3 hover:from-destructive/50 hover:to-destructive/20 text-sm rounded-lg transition-colors duration-300"
              >
                {showPasswordForm
                  ? "Cancel"
                  : hasCredentialAccount
                    ? "Update"
                    : "Set up"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showPasswordForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-4 px-8 pb-6">
                    {hasCredentialAccount && (
                      <div className="relative">
                        <label className="text-xs font-semibold text-foreground/70 mb-1 block">
                          Current Password
                        </label>
                        <Input
                          type={showCurrPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          autoComplete="current-password"
                          className="bg-input/80 rounded-xl h-12 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrPw((v) => !v)}
                          className="absolute right-4 top-8 text-accent/60 hover:text-accent"
                          tabIndex={-1}
                        >
                          {showCurrPw ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <label className="text-xs font-semibold text-foreground/70 mb-1 block">
                        New Password
                      </label>
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewPassword(val);
                          setPwReqs(
                            PW_REQUIREMENTS.map((r) => ({
                              ...r,
                              complete: r.validate(val),
                            })),
                          );
                        }}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        className="bg-input/80 rounded-xl h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-4 top-8 text-accent/60 hover:text-accent"
                        tabIndex={-1}
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={onPasswordSubmit}
                      disabled={passwordLoading}
                      className="w-full h-11 bg-primary/90 text-accent font-bold rounded-xl shadow-sm shadow-primary/50 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                    >
                      {passwordLoading
                        ? "Saving..."
                        : hasCredentialAccount
                          ? "Update Password"
                          : "Set Password"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
          onClick={() => setPendingDelete("delete")}
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

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)", y: 0 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
              <h4 className="text-base font-semibold text-accent/90">
                Confirm Delete
              </h4>
              <p className="mt-2 text-sm text-foreground/75">
                Are you sure you want to delete this user?
                <br />
                <b>This action <b className="text-destructive brightness-110">CANNOT</b> be undone</b>
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingDelete(null)}
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteUser}
                >
                  Yes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
