import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, LogOut, Coins, Flame } from 'lucide-react'
import { cn } from './lib/utils'
import Layout from './components/Layout'
import Login from './components/Login'
import PlayerDashboard from './components/PlayerDashboard'
import AdminDashboard from './components/AdminDashboard'
import AdminHome from './components/AdminHome'
import Scanner from './components/Scanner'
import ScanHistory from './components/ScanHistory'
import Leaderboard from './components/Leaderboard'
import Profile from './components/Profile'
import { UserProvider, useUser } from './context/UserContext'
import { ToastProvider, useToast } from './components/Toast'
import { StatsProvider, useStats } from './context/StatsContext'
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext'
import { initDatabase } from './db'

/**
 * Main App Component
 * Initializes SQLite database on mount and manages global state
 */
function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState(null)

  // Initialize SQLite database once on mount
  useEffect(() => {
    const initDB = async () => {
      try {
        await initDatabase()
        setDbReady(true)
      } catch (err) {
        console.error('Failed to initialize database:', err)
        setDbError(err.message)
      }
    }
    initDB()
  }, [])

  // Database error state
  if (dbError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <h2 className="text-lg font-medium mb-2">Database Error</h2>
          <p className="text-muted text-sm">{dbError}</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!dbReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-success border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <UserProvider>
      <ToastProvider>
        <StatsProvider>
          <AccessibilityProvider>
            <AppContent />
          </AccessibilityProvider>
        </StatsProvider>
      </ToastProvider>
    </UserProvider>
  )
}

/**
 * App Content with Navigation
 * Handles authentication and tab-based navigation
 */
function AppContent() {
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useUser()
  const { coins, streak } = useStats()
  const { isElderlyMode } = useAccessibility()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('home')
  const [selectedFile, setSelectedFile] = useState(null)

  // Handle file selection from PlayerDashboard (elderly mode direct scan)
  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setActiveTab('scan')
  }

  // Reset to home when user changes
  useEffect(() => {
    setActiveTab('home')
  }, [user?.id])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-success border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully')
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Render the active page content
  const renderPage = () => {
    switch (activeTab) {
      case 'scan':
        return <ScanPage initialFile={selectedFile} onScanComplete={() => setSelectedFile(null)} />
      case 'history':
        return <ScanHistory />
      case 'leaderboard':
        return <Leaderboard />
      case 'profile':
        return <Profile />
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <PlayerDashboard onScanClick={() => setActiveTab('scan')} onFileSelect={handleFileSelect} />
      case 'home':
      default:
        return isAdmin ? <AdminHome /> : <PlayerDashboard onScanClick={() => setActiveTab('scan')} onFileSelect={handleFileSelect} />
    }
  }

  return (
    <div className={isElderlyMode ? 'elderly-mode' : ''}>
      <Layout activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Header with Stats and Logout */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
          {/* Coins Display - Smaller in Elderly Mode */}
          <motion.div
            key={coins}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={cn(
              "glass flex items-center gap-2",
              isElderlyMode
                ? "rounded-xl px-2 py-1 text-xs"
                : "rounded-2xl px-3 py-2"
            )}
          >
            <Coins className={cn(isElderlyMode ? "w-3 h-3" : "w-4 h-4", "text-amber-400")} />
            <span className={cn(isElderlyMode ? "text-xs" : "text-sm", "font-medium")}>{coins}</span>
            {streak > 0 && (
              <>
                <div className={cn("w-px bg-white/10", isElderlyMode ? "h-3" : "h-4")} />
                <Flame className={cn(isElderlyMode ? "w-3 h-3" : "w-4 h-4", "text-orange-400")} />
                <span className={cn(isElderlyMode ? "text-xs" : "text-sm", "font-medium")}>{streak}</span>
              </>
            )}
          </motion.div>

          {/* Logout Button - More visible in Elderly Mode */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={cn(
              "rounded-2xl flex items-center justify-center transition-colors",
              isElderlyMode
                ? "w-9 h-9 bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                : "w-10 h-10 bg-white/5 hover:bg-white/10 text-muted hover:text-foreground backdrop-blur-md"
            )}
          >
            <LogOut size={isElderlyMode ? 16 : 18} />
          </motion.button>
        </div>

        {/* Page Content with Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="pt-16"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  )
}

/**
 * Scan Page Component
 * Wraps Scanner with proper styling
 */
function ScanPage({ initialFile, onScanComplete }) {
  return (
    <div className="pt-2">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-semibold">Media Scanner</h1>
        <p className="text-sm text-muted">Analyze media for deepfakes</p>
      </div>
      <Scanner initialFile={initialFile} onScanComplete={onScanComplete} />
    </div>
  )
}

export default App
