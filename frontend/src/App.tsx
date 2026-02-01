import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar/Navbar'
import Home from '@/pages/Home/Home'

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
