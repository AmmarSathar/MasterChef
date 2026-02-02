import React, { useState } from 'react'                                         // Import React library, 'useState' hook to allow function to store/update local state between renders
import showIcon from '@/components/lib/icons/show.svg'
import hideIcon from '@/components/lib/icons/hide.svg'

export default function Login() {                                               // Define Login functional component; 'export default' to allow other files to import this component
  const [email, setEmail] = useState('')                                        // State var 'email'; Format: [current value, function to update, initial val == empty string]
  const [password, setPassword] = useState('')                                  // State var 'password'; initial val == empty string
  const [remember, setRemember] = useState(false)                               // State var 'remember' for Remember Me checkbox; initial val == Boolean false
  const [showPassword, setShowPassword] = useState(false)                       // State var 'showPassword' to toggle password visibility; initial val == Boolean false

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {                 // Define function to handle form submission; 'e' is the event object
    e.preventDefault()                                                          // Prevent browser default behavior e.g. page reload upon form submission
    // TODO: Wire up authentication
    console.log({ email, password, remember })                                  // Log email, password, remember values to browser console (for testing purposes)
  }

  return (                                                                      // Define JSX to render the login form
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">        { /* Container for Login form with Tailwind CSS styling classes */ }
        <h1 className="text-2xl font-semibold mb-4">Login</h1>                  { /* Heading for the login form */ }
        <form onSubmit={handleSubmit} className="space-y-4">                    { /* Form element with onSubmit handler; calls handleSubmit when user clicks 'Sign In' or presses Enter */ }
        <div>                                                                   { /* Container for Email input field */ }
            <input
                type="email"                                                    // 'email' input type to allow browser validation for email format
                value={email}                                                   // Sync 'email' state var with current val of field
                onChange={(e) => setEmail(e.target.value)}                      // Update 'email' state var as soon as user types in field
                required                                                        // Validate the field is filled before user submits form
                className="w-full px-3 py-2 border rounded"                     // Tailwind CSS styling classes
                placeholder="Email"                                             // Preview text 'Email' when field is empty
            />
        </div>
        <div>                                                                   { /* Container for Password input field */ }               
            <div className="relative">                                          { /* Allow show/hide password button to be positioned relative to password container*/ }
                <input
                    type={showPassword ? 'text' : 'password'}                   // Toggle input type: 'showPassword' state true = 'text' (unmasked) / false = 'password' (masked)
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Password"
                />
                <button                                                         
                    type="button"                                               //'button' type to prevent form submission when toggling password visibility
                    onClick={() => setShowPassword(!showPassword)}              // Toggle 'showPassword' state between true/false when button is clicked
                    className="absolute right-3 top-2.5"
                >
                    <img
                        src={showPassword ? showIcon : hideIcon}                // Display 'showIcon' when true, 'hideIcon' when false
                        className="w-6 h-6"
                    />
                </button>
            </div>
        </div>                                                                  { /* Remember me checkbox and forgot password link */ }
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
