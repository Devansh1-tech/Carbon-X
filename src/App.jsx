import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProjectSubmission from './pages/ProjectSubmission'
import Wallet from './pages/Wallet'
import Marketplace from './pages/Marketplace'
import Watchlist from './pages/Watchlist'
import OnboardingFlow from './pages/OnboardingFlow'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import Leaderboard from './pages/Leaderboard'
import EmissionsCalculator from './pages/EmissionsCalculator'
import DemoChecklist from './pages/DemoChecklist'
import ToastContainer from './components/Toast'
import NotificationCenter from './components/NotificationCenter'
import GlobalSearch from './components/GlobalSearch'
import AchievementPopup from './components/AchievementPopup'
import ErrorBoundary from './components/ErrorBoundary'
import DemoController from './components/DemoController'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'

/* ── Loading overlay with skeleton feel ── */
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
          <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
          <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
          <Route path="/onboarding" element={<ErrorBoundary><OnboardingFlow /></ErrorBoundary>} />
          <Route path="/dashboard/farmer" element={<ErrorBoundary><FarmerDashboard /></ErrorBoundary>} />
          <Route path="/dashboard/company" element={<ErrorBoundary><CompanyDashboard /></ErrorBoundary>} />
          <Route path="/dashboard/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
          <Route path="/submit-project" element={<ErrorBoundary><ProjectSubmission /></ErrorBoundary>} />
          <Route path="/wallet" element={<ErrorBoundary><Wallet /></ErrorBoundary>} />
          <Route path="/marketplace" element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
          <Route path="/watchlist" element={<ErrorBoundary><Watchlist /></ErrorBoundary>} />
          <Route path="/analytics" element={<ErrorBoundary><AnalyticsDashboard /></ErrorBoundary>} />
          <Route path="/leaderboard" element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
          <Route path="/emissions-calculator" element={<ErrorBoundary><EmissionsCalculator /></ErrorBoundary>} />
          <Route path="/demo-check" element={<DemoChecklist />} />
        </Routes>
      </div>
    </>
  )
}

/* ── Global keyboard shortcut handler ── */
function GlobalKeyboardHandler({ onToggleSearch, onToggleDemo, onToggleShortcuts }) {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      // Don't trigger in input fields
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') e.target.blur()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); onToggleSearch() }
      else if ((e.ctrlKey || e.metaKey) && e.key === '1') { e.preventDefault(); navigate('/dashboard/farmer') }
      else if ((e.ctrlKey || e.metaKey) && e.key === '2') { e.preventDefault(); navigate('/marketplace') }
      else if ((e.ctrlKey || e.metaKey) && e.key === '3') { e.preventDefault(); navigate('/wallet') }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') { e.preventDefault(); onToggleDemo() }
      else if (e.key === '?' && !e.ctrlKey && !e.metaKey) { onToggleShortcuts() }
      else if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-all-modals'))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate, onToggleSearch, onToggleDemo, onToggleShortcuts])

  return null
}

function App() {
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [demoExpanded, setDemoExpanded] = useState(false)

  useEffect(() => {
    const handler = () => setGlobalSearchOpen((v) => !v)
    document.addEventListener('toggle-global-search', handler)

    const closeAll = () => {
      setGlobalSearchOpen(false)
      setShortcutsOpen(false)
    }
    document.addEventListener('close-all-modals', closeAll)

    // Toggle demo via custom event
    const demoHandler = () => setDemoExpanded((v) => !v)
    document.addEventListener('toggle-demo-controller', demoHandler)

    // Toggle shortcuts via custom event
    const shortcutsHandler = () => setShortcutsOpen((v) => !v)
    document.addEventListener('toggle-shortcuts', shortcutsHandler)

    return () => {
      document.removeEventListener('toggle-global-search', handler)
      document.removeEventListener('close-all-modals', closeAll)
      document.removeEventListener('toggle-demo-controller', demoHandler)
      document.removeEventListener('toggle-shortcuts', shortcutsHandler)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-carbon">
        <GlobalKeyboardHandler
          onToggleSearch={() => setGlobalSearchOpen((v) => !v)}
          onToggleDemo={() => document.dispatchEvent(new CustomEvent('toggle-demo-controller'))}
          onToggleShortcuts={() => setShortcutsOpen((v) => !v)}
        />
        <AnimatedRoutes />
        <ToastContainer />
        <NotificationCenter />
        <GlobalSearch isOpen={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
        <AchievementPopup />
        <DemoController />
        <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    </Router>
  )
}

export default App
