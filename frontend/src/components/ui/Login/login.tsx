import { useEffect, useState } from "react";

import { User } from "@masterchef/shared/types/user";

import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import Google from "@/lib/icons/google.svg";
import Github from "@/lib/icons/github.svg";

export default function Login() {
  const [tempUser, setTempUser] = useState<User>();

  return (
    <>
      <div
        className="login-root absolute h-full w-full flex items-center justify-center"
        style={{
          background: `
        linear-gradient(135deg, 
          oklch(var(--background-oklch)) 0%, 
          oklch(var(--card-oklch)) 25%, 
          oklch(var(--primary-oklch)) 50%, 
          oklch(var(--accent-oklch)) 75%, 
          oklch(var(--brand-secondary-oklch)) 100%
        ),
        radial-gradient(ellipse at 20% 30%, oklch(var(--primary-oklch)) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, oklch(var(--accent-oklch)) 0%, transparent 50%)
          `,
          backgroundBlendMode: "soft-light, normal, normal",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="login-container bg-card/80 backdrop-blur-sm relative h-210 w-130 flex flex-col gap-10 items-center justify-center rounded-2xl shadow-sm shadow-border border border-border/80 bg-linear-to-br from-card/50 to-background/50 p-0 m-0">
          <div className="login-header w-full h-auto p-5 m-0 relative flex flex-col items-center justify-center gap-3">
            <Badge className="login-badge flex px-2 py-1 bg-primary/30 border border-primary shadow-sm shadow-background font-bold tracking-wide text-accent/90">
              Start your Cook Journey
            </Badge>
            <span className="text-3xl font-extrabold text-foreground text-shadow-2xs tracking-tight">
              Create Account
            </span>
            <span className="text-sm text-accent/70 tracking-wide">
              Join and become a home chef planning smarter
            </span>
          </div>

          <div className="login-form w-full h-auto flex flex-col items-center justify-center gap-7 px-15">
            {[
              {
                label: "Full Name",
                id: "name",
                placeholder: "e.g. John Doe",
                type: "text",
              },
              {
                label: "Email Address",
                id: "email",
                placeholder: "best.cook@example.com",
                type: "email",
              },
              {
                label: "Password",
                id: "password",
                placeholder: "Make it strong",
                type: "password",
              },
            ].map((field) => (
              <div className="grid w-full items-center gap-3" key={field.id}>
                <Label htmlFor={field.id} className="font-bold text-accent/85">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  type={field.type}
                  autoComplete="new-password" // for password fields
                  className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5"
                />
              </div>
            ))}

            <button className="w-full h-13 bg-primary/90 text-accent font-bold rounded-full shadow-sm shadow-primary/50 hover:shadow-primary/90 hover:opacity-90 cursor-pointer transition-all duration-200">
              Create Account
            </button>
          </div>

          {/* <div className="login-button w-full h-auto flex items-center justify-center pb-5 px-15"></div> */}

          <div className="login-others w-full h-auto flex flex-col items-center justify-center px-15 gap-5">
            <div className="flex items-center w-full gap-4">
              <hr className="flex-1 border-border/40" />
              <span className="text-xs scale-80 tracking-widest text-muted-foreground/70 uppercase font-bold">
                Or Sign-Up with
              </span>
              <hr className="flex-1 border-border/40" />
            </div>
            <div className="login-icons w-full h-auto flex items-center justify-center gap-4">
              <button className="login-google flex w-full items-center justify-center gap-3 px-4 py-4 border border-border/60 bg-input/40 rounded-full shadow-sm shadow-border/60 hover:opacity-90 cursor-pointer transition-all">
                <img src={Google} alt="google-icon" className="w-4 h-4" />
                <span className="font-bold text-sm text-accent">
                  Google
                </span>
              </button>
              <button className="login-github flex w-full items-center justify-center gap-3 px-4 py-4 border border-border/60 bg-input/40 rounded-full shadow-sm shadow-border/60 hover:opacity-90 cursor-pointer transition-all">
                <img src={Github} alt="github-icon" className="w-4 h-4 invert-(--filter-invert-d-l)" />
                <span className="font-bold text-sm text-accent ">
                  GitHub
                </span>
              </button>
            </div>

            <div className="login-no-account w-full flex items-center justify-center gap-1 py-5">
              <span className="font-bold text-sm text-accent/70">Already have an account?</span>
              <a href="/login#create-account" className="text-sm font-extrabold text-destructive/60 hover:text-destructive/80 transition-all underline">Log-In</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
