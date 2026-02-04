import React, { useState } from 'react'                             // Import React library, 'useState' hook to allow function to store/update local state between renders
import showIcon from '@/lib/icons/show.svg'
import hideIcon from '@/lib/icons/hide.svg'
import { Badge } from "@components/ui/badge"
import { Input } from "@components/ui/input"
import { Label } from '@/components/ui/label'
import "@components/ui/Login/login.css"

export default function Login2() {                                  // Define Login functional component; 'export default' to allow other files to import this component
  const [email, setEmail] = useState('')                            // State var 'email'; Format: [current value, function to update, initial val == empty string]
  const [password, setPassword] = useState('')                      // State var 'password'; initial val == empty string 
  const [remember, setRemember] = useState(false)                   // State var 'remember' for Remember Me checkbox; initial val == Boolean false
  const [showPassword, setShowPassword] = useState(false)           // State var 'showPassword' to toggle password visibility; initial val == Boolean false

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {   // Define function to handle form submission; 'e' is the event object
    e.preventDefault()                                              // Prevent browser default behavior e.g. page reload upon form submission
    if (!email || !password) {
      alert('Please fill out all fields')
      return
    }    
    // TODO: Wire up authentication
    console.log({ email, password, remember })                      // Log email, password, remember values to browser console (for testing purposes)
  }

  return (                                                          // Define JSX to render the login form
    <div className="login-root absolute h-full w-full flex items-center justify-center"
        style={{                                                    // Background styling using CSS gradients (1 linear + 2 radial) in OKLCH colour space
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
            backgroundBlendMode: "soft-light, normal, normal",      // Blend modes for layers (soft-light linear, normal radial)
            backgroundAttachment: "fixed",                          // Fix background when scrolling 
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
            Log in to continue your Cook Journey
          </span>
        </div>

        <form onSubmit={handleSubmit}                               // Calls handleSubmit when user clicks 'Sign In' or presses Enter
            className="login-form w-full h-auto flex flex-col items-center justify-center gap-7 px-15">
          <div className="grid w-full items-center gap-3">          { /* Container for Email input field */ }
            <Label htmlFor="email" className="font-bold text-accent/85">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="best.cook@example.com"
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

          <div className="flex items-center justify-between w-full px-6.5 -mt-4">
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