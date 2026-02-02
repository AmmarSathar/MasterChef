import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar/Navbar'
import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
