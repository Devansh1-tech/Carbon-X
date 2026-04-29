import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProjectSubmission from './pages/ProjectSubmission'
import Wallet from './pages/Wallet'
import Marketplace from './pages/Marketplace'
import OnboardingFlow from './pages/OnboardingFlow'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import Leaderboard from './pages/Leaderboard'
import ToastContainer from './components/Toast'
import NotificationCenter from './components/NotificationCenter'
import AchievementPopup from './components/AchievementPopup'

/* ── Loading overlay ── */
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[300] bg-[#0f1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  )
}

/* ── Page wrapper with fade + loading ── */
function AnimatedRoutes() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [pageKey, setPageKey] = useState(location.key)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setLoading(false)
      setPageKey(location.key)
    }, 400)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <>
      {loading && <LoadingOverlay />}
      <div key={pageKey} className="animate-fadeIn">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
          <Route path="/dashboard/company" element={<CompanyDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/submit-project" element={<ProjectSubmission />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-carbon">
        <AnimatedRoutes />
        <ToastContainer />
        <NotificationCenter />
        <AchievementPopup />
        {/* Demo badge */}
        <div className="fixed bottom-4 left-4 z-[200] px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
          <span className="text-[11px] text-gray-500 font-medium">🎭 Hackathon Demo</span>
        </div>
      </div>
    </Router>
  )
}

export default App
