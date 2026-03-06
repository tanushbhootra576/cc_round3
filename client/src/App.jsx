import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CitizenDashboard from './pages/CitizenDashboard'
import GovernmentDashboard from './pages/GovernmentDashboard'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import CitizenProfile from './pages/CitizenProfile'
import GovernmentProfile from './pages/GovernmentProfile'
import GovManageAlerts from './pages/GovManageAlerts'
import GovAnnouncements from './pages/GovAnnouncements'
import CityFeed from './pages/CityFeed'
import GovAnalytics from './pages/GovAnalytics'
import GovBudget from './pages/GovBudget'
import WardManagement from './pages/WardManagement'
import LiveDashboard from './pages/LiveDashboard'
import './App.css'

// Route guard helpers
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 text-xs mono tracking-widest">SYS_INIT…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'government' ? '/gov-dashboard' : '/dashboard'} replace />
  }
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'government' ? '/gov-dashboard' : '/dashboard'} replace />
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* Citizen */}
        <Route path="/dashboard" element={<RequireAuth role="citizen"><CitizenDashboard /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth role="citizen"><ReportIssue /></RequireAuth>} />
        <Route path="/city-feed" element={<RequireAuth role="citizen"><CityFeed /></RequireAuth>} />

        {/* Government */}
        <Route path="/gov-dashboard" element={<RequireAuth role="government"><GovernmentDashboard /></RequireAuth>} />
        <Route path="/gov-alerts" element={<RequireAuth role="government"><GovManageAlerts /></RequireAuth>} />
        <Route path="/gov-announcements" element={<RequireAuth role="government"><GovAnnouncements /></RequireAuth>} />
        <Route path="/gov-analytics" element={<RequireAuth role="government"><GovAnalytics /></RequireAuth>} />
        <Route path="/gov-budget" element={<RequireAuth role="government"><GovBudget /></RequireAuth>} />
        <Route path="/gov-wards" element={<RequireAuth role="government"><WardManagement /></RequireAuth>} />
        <Route path="/gov-live" element={<RequireAuth role="government"><LiveDashboard /></RequireAuth>} />

        {/* Shared */}
        <Route path="/issues/:id" element={<RequireAuth><IssueDetail /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><CitizenProfile /></RequireAuth>} />
        <Route path="/gov-profile" element={<RequireAuth role="government"><GovernmentProfile /></RequireAuth>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

