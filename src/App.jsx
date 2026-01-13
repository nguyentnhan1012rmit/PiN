import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import PhotographerDashboard from './pages/PhotographerDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-100 font-sans text-base-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PhotographerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
