import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar/Navbar'
import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/login'
import Login2 from '@/pages/Login2/login2'

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login2" element={<Login2 />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}