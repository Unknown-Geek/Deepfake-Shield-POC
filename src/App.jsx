import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, LogOut } from 'lucide-react'
import Layout from './components/Layout'
import Login from './components/Login'
import PlayerDashboard from './components/PlayerDashboard'
import AdminDashboard from './components/AdminDashboard'
import Scanner from './components/Scanner'
import { UserProvider, useUser } from './context/UserContext'
import { ToastProvider, useToast } from './components/Toast'
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
        <AppContent />
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
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('home')

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
        return <ScanPage />
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <PlayerDashboard />
      case 'home':
      default:
        return isAdmin ? <AdminDashboard /> : <PlayerDashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {/* Logout button in header */}
      <div className="absolute top-6 right-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors backdrop-blur-md"
        >
          <LogOut size={18} />
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
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

/**
 * Scan Page Component
 * Wraps Scanner with proper styling
 */
function ScanPage() {
  return (
    <div className="pt-6">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-semibold">Media Scanner</h1>
        <p className="text-sm text-muted">Analyze media for deepfakes</p>
      </div>
      <Scanner />
    </div>
  )
}

export default App
