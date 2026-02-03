import React, { useState } from 'react'
import showIcon from '@/lib/icons/show.svg'
import hideIcon from '@/lib/icons/hide.svg'
import { Badge } from "@components/ui/badge"
import { Input } from "@components/ui/input"
import "@components/ui/Login/login.css"
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password, remember })
  }

  return (
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
      <div className="login-container bg-card/80 backdrop-blur-sm relative h-auto w-130 flex flex-col gap-10 items-center justify-center rounded-2xl shadow-sm shadow-border border border-border/80 bg-linear-to-br from-card/50 to-background/50 p-0 m-0">
        <div className="login-header w-full h-auto p-5 m-0 relative flex flex-col items-center justify-center gap-3">
          <Badge className="login-badge flex px-2 py-1 bg-primary/30 border border-primary shadow-sm shadow-background font-bold tracking-wide text-accent/90">
            Welcome Back
          </Badge>
          <span className="text-3xl font-extrabold text-foreground text-shadow-2xs tracking-tight">
            Sign In
          </span>
          <span className="text-sm text-accent/70 tracking-wide">
            Log in to your account to continue
          </span>
        </div>

        <form onSubmit={handleSubmit} className="login-form w-full h-auto flex flex-col items-center justify-center gap-7 px-15">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email" className="font-bold text-accent/85">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5"
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="password" className="font-bold text-accent/85">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 not-focus:bg-input/80 px-5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-3.5"
              >
                <img
                  src={showPassword ? showIcon : hideIcon}
                  className="w-6 h-6"
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-15">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-sm font-medium text-accent/70">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-destructive/60 hover:text-destructive/80 transition-all underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full h-13 bg-primary/90 text-accent font-bold rounded-full shadow-sm shadow-primary/50 hover:shadow-primary/90 hover:opacity-90 cursor-pointer transition-all duration-200 px-15"
          >
            Sign In
          </button>
        </form>

        <div className="login-signup w-full flex items-center justify-center gap-1 py-5 px-15">
          <span className="font-bold text-sm text-accent/70">
            Don't have an account?
          </span>
          <a
            href="/register"
            className="text-sm font-extrabold text-destructive/60 hover:text-destructive/80 transition-all underline"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}