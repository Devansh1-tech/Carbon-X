import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProjectSubmission from './pages/ProjectSubmission'
import Wallet from './pages/Wallet'
import Marketplace from './pages/Marketplace'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-carbon">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
          <Route path="/dashboard/company" element={<CompanyDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/submit-project" element={<ProjectSubmission />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
