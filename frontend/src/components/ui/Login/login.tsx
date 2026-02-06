import { useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { toast } from "react-hot-toast";

import { User } from "@masterchef/shared/types/user";
import Customize from "./Customize";
import PasswordRequirements from "./PasswordRequirements";
import Grainient from "@/components/Grainient";

import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import Footer from "@components/ui/footer";

import Google from "@/lib/icons/google.svg";
import Github from "@/lib/icons/github.svg";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

const passRequirements = [
  {
    complete: false,
    label: "At least 8 characters",
    error: "The password is too short",
    validate: (partial: string) => partial.length >= 8,
  },
  {
    complete: false,
    label: "Contains uppercase letter",
    error: "The password must have an uppercase letter",
    validate: (partial: string) => /[A-Z]/.test(partial),
  },
  {
    complete: false,
    label: "Contains lowercase letter",
    error: "The password must have a lowercase letter",
    validate: (partial: string) => /[a-z]/.test(partial),
  },
  {
    complete: false,
    label: "Contains number",
    error: "The password must contain a number",
    validate: (partial: string) => /[0-9]/.test(partial),
  },
  {
    complete: false,
    label: "Contains special character",
    error: "The password must contain a special character",
    validate: (partial: string) => /[!@#$%^&*(),.?":{}|<>]/.test(partial),
  },
];

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export default function Login() {
  const [showCustomize, setShowCustomize] = useState(false);
  const [isCustomizeReady, setIsCustomizeReady] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // If false: Register
  const [partialPasswordReq, setPartialPasswordReq] =
    useState(passRequirements);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isChangingState, setIsChangingState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginContainerRef = useRef<HTMLDivElement>(null);
  const customizeContainerRef = useRef<HTMLDivElement>(null);

  // Methods to trace tailwindcss theme changes in plain ts. It's really not efficient, but will be enough for the firt sprint demo..
  const cssVar = (name: string, fallback: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback;

  const [, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const queryRegister = queryParameters.get("register");

    if (queryRegister === "true") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [isLogin]);

  const changeRegisterState = () => {
    if (isChangingState) return;

    setIsChangingState(true);
    console.log("called");
    setIsLogin(!isLogin);
    const params = new URLSearchParams(window.location.search);
    params.set("register", isLogin.toString());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );

    setTimeout(() => {
      setIsChangingState(false);
    }, 1000);
  };

  const completeRegistration = async (formData: FormData) => {
    if (partialPasswordReq.some((req) => !req.complete)) {
      console.log(partialPasswordReq.filter((req) => !req.complete));
      toast.error(partialPasswordReq.filter((req) => !req.complete)[0].error);
      return false;
    }

    const registrationToast = toast.loading(
      isLogin ? "Logging in..." : "Creating account...",
    );

    if (isLogin) {
      console.log("Login");
      let response: AxiosResponse<{ success: boolean; user: User }> | undefined;

      try {
        response = await axios.post<{ success: boolean; user: User }>(
          `${BASE_API_URL}/auth/login`,
          {
            email: formData.get("email"),
            password: formData.get("password"),
          },
        );

        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        toast.dismiss(registrationToast);
        toast.success(`Logged in successfully!\nWelcome back ${user.name}!`);
        return true;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          const status = err.response.status;

          if (status === 400) {
            toast.dismiss(registrationToast);
            toast.error("Invalid login data.");
            console.error("Validation error:", err);
          } else if (status === 401) {
            toast.dismiss(registrationToast);
            toast.error("Invalid email or password.");
            console.error("Invalid credentials:", err);
          }
        } else {
          toast.dismiss(registrationToast);
          toast.error(`An unexpected error occurred. Please try again.`);
          console.error("Request failed:", err);
        }
      }
    } else {
      console.log("Sign Up");

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const name = formData.get("name") as string;

      let response: AxiosResponse<{ success: boolean; user: User }> | undefined;

      console.log("Passed logon for: ", email, name);

      try {
        response = await axios.post<{ success: boolean; user: User }>(
          `${BASE_API_URL}/auth/register`,
          {
            email: email,
            password: password,
            name: name,
          },
        );

        const user = response.data.user;
        //save user in localstorage for autoconnect
        localStorage.setItem("user", JSON.stringify(user));

        toast.dismiss(registrationToast);
        toast.success(`Account created successfully!\nWelcome aboard ${name}!`);
        return true;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          const status = err.response.status;

          if (status === 400) {
            toast.dismiss(registrationToast);
            toast.error("Invalid registration data.");
            console.error("Validation error:", err);
          } else if (status === 409) {
            toast.dismiss(registrationToast);
            toast.error("Email is already taken.");
            console.error("Email already taken:", err);
          }
        } else {
          toast.dismiss(registrationToast);
          toast.error(`An unexpected error occurred. Please try again.`);
          console.error("Request failed:", err);
        }
      }
    }
  };

  const handleCreateAccount = async (formData: FormData) => {
    const success = await completeRegistration(formData);
    // console.log("passed 1");
    if (success) {
      // console.log("passed");
      if (loginContainerRef.current) {
        loginContainerRef.current.classList.add("login-fadeout");
      }

      setTimeout(() => {
        setShowCustomize(true);
      }, 800);

      setTimeout(() => {
        if (customizeContainerRef.current) {
          customizeContainerRef.current.classList.add("customize-slide");
        }
      }, 1000);

      setTimeout(() => {
        if (customizeContainerRef.current) {
          customizeContainerRef.current.classList.add("customize-expand");
        }
      }, 1800);

      setTimeout(() => {
        setIsCustomizeReady(true);
      }, 3000);
    }
  };

  return (
    <div className="login-root absolute h-full w-full flex flex-col items-center justify-center max-md:z-100 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* React-Bits theme that follows mutated tailwindcss theme palette.. */}
        <Grainient
          color1={cssVar("--grain-color-1", "#d7c7e7")}
          color2={cssVar("--grain-color-2", "#ffdab9")}
          color3={cssVar("--grain-color-3", "#f1eee8")}
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
          className="opacity-60"
        />
      </div>
      {showCustomize && (
        <div
          ref={customizeContainerRef}
          className="login-customize-container bg-card/80 backdrop-blur-sm relative flex items-center justify-center rounded-2xl shadow-sm shadow-border border border-border/80 bg-linear-to-br from-card/50 to-background/50 p-20 max-md:p-7 customize-show"
        >
          <Customize ready={isCustomizeReady} />
        </div>
      )}

      {!showCustomize && (
        <div
          ref={loginContainerRef}
          className={`login-container bg-card/80 backdrop-blur-sm relative w-130 max-md:w-full flex flex-col gap-10 items-center justify-center rounded-2xl max-md:rounded-none shadow-sm shadow-border border border-border/80 bg-linear-to-br from-card/50 to-background/50 p-0 m-0 transition-all ease-out duration-300 ${isLogin ? "h-180" : "h-210"} max-md:h-full`}
        >
          <div
            className={`login-header w-full h-auto p-5 m-0 relative flex flex-col items-center justify-center gap-3 max-md:pb-0`}
          >
            <Badge className="login-badge flex px-2 py-1 bg-primary/30 border border-primary shadow-sm shadow-background font-bold tracking-wide text-accent/90">
              {isLogin
                ? "Get back to innovative cooking"
                : "Start your Cook Journey"}
            </Badge>
            <span className="text-3xl font-extrabold text-foreground text-shadow-2xs tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </span>
            <span className="text-sm text-accent/70 tracking-wide max-md:text-center">
              {isLogin
                ? "Bring changes to your kitchen routine"
                : "Join and become a home chef planning smarter"}
            </span>
          </div>

          <form
            className="login-form w-full h-auto flex flex-col items-center justify-center gap-7 px-15 max-md:px-5 relative"
            onSubmit={(e) => {
              e.preventDefault();
              console.log(e.target);
              handleCreateAccount(new FormData(e.currentTarget));
            }}
          >
            {!isLogin && (
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="name" className="font-bold text-accent/85">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  type="text"
                  autoComplete="name"
                  className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5"
                  required
                />
              </div>
            )}

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="email" className="font-bold text-accent/85">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="best.cook@example.com"
                type="email"
                autoComplete="email"
                className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5"
                required
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="password" className="font-bold text-accent/85">
                Password
              </Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  name="password"
                  placeholder={isLogin ? "BestCook123" : "Make it strong"}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onFocus={() => {
                    setIsPasswordFocused(true);
                  }}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={(event) => {
                    const partialPassword = event.target.value;
                    console.log(partialPassword);
                    partialPasswordReq.forEach((requirement) => {
                      requirement.complete =
                        requirement.validate(partialPassword);
                      if (requirement.complete) {
                        console.log(`Requirement met: ${requirement.label}`);
                      }
                    });
                    setPartialPasswordReq([...partialPasswordReq]);
                    console.log(partialPasswordReq);
                  }}
                  className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/60 hover:text-accent transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="password-requirements-container absolute mt-5 z-100 md:absolute md:-right-5 md:bottom-50 max-md:fixed max-md:left-0 max-md:bottom-50 max-md:w-full">
                <PasswordRequirements
                  requirements={partialPasswordReq}
                  show={isPasswordFocused}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-start w-full -mt-3">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  id="remember-me"
                  className="w-5 h-5 ml-1/2 rounded-full border-2 border-accent/60 bg-accent text-primary transition-all duration-150 focus:ring-2 focus:ring-border/50 cursor-pointer"
                />
                <Label
                  htmlFor="remember-me"
                  className="ml-2 text-sm font-bold text-accent/70 cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-13 bg-primary/90 text-accent font-bold rounded-full shadow-sm shadow-primary/50 hover:shadow-primary/90 hover:opacity-90 cursor-pointer transition-all duration-200"
            >
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <div
            className={`login-others w-full h-auto flex flex-col items-center justify-center px-15 gap-5`}
          >
            <div className="flex items-center w-full gap-4">
              <hr className="flex-1 border-border/40" />
              <span className="text-xs scale-80 tracking-widest text-muted-foreground/70 uppercase font-bold">
                Or {isLogin ? "Sign-In" : "Sign-Up"} with
              </span>
              <hr className="flex-1 border-border/40" />
            </div>
            <div className="login-icons w-full h-auto flex items-center justify-center gap-4">
              <button className="login-google flex w-full items-center justify-center gap-3 px-4 py-4 border border-border/60 bg-input/40 rounded-full shadow-sm shadow-border/60 hover:opacity-90 cursor-pointer transition-all">
                <img
                  src={Google}
                  alt="google-icon"
                  className="w-4 h-4 pointer-events-none"
                />
                <span className="font-bold text-sm text-accent pointer-events-none">
                  Google
                </span>
              </button>
              <button className="login-github flex w-full items-center justify-center gap-3 px-4 py-4 border border-border/60 bg-input/40 rounded-full shadow-sm shadow-border/60 hover:opacity-90 cursor-pointer transition-all">
                <img
                  src={Github}
                  alt="github-icon"
                  className="w-4 h-4 invert-(--filter-invert-d-l) pointer-events-none"
                />
                <span className="font-bold text-sm text-accent pointer-events-none">
                  GitHub
                </span>
              </button>
            </div>

            <div className="login-no-account w-full flex items-center justify-center gap-1 py-5">
              <span className="font-bold text-sm text-accent/70">
                {isLogin ? "Don't " : "Already "} have an account?
              </span>
              <button
                className="all-[unset] text-sm font-extrabold text-destructive/60 hover:text-destructive/80 transition-all underline cursor-pointer"
                disabled={isChangingState}
                onClick={changeRegisterState}
              >
                {isLogin ? "Sign-Up" : "Log-In"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer className="fixed bottom-10"/>
    </div>
  );
}
