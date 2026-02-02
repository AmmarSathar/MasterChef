import React, { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Wire up authentication here
    console.log({ email, password, remember })
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        { /* Email input field */ }
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Email"
          />
        </div>
        { /* Password input field */ }
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Password"
          />
        </div>
        { /* 'Remember Me' checkbox + 'Forgot Password' link */ }
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mr-2"
            />
            Remember Me
          </label>
          <a href="#" className="text-sm text-blue-600">Forgot Password?</a>
        </div>
        <div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded">
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}
