import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, LogOut } from 'lucide-react'
import Layout from './components/Layout'
import Login from './components/Login'
import PlayerDashboard from './components/PlayerDashboard'
import AdminDashboard from './components/AdminDashboard'
import { UserProvider, useUser } from './context/UserContext'
import { ToastProvider, useToast } from './components/Toast'
import { initDatabase } from './db'

function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState(null)

  // Initialize database on mount
  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err)
        setDbError(err.message)
      })
  }, [])

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

function AppContent() {
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useUser()
  const toast = useToast()

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

  if (!isAuthenticated) {
    return <Login />
  }

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully')
  }

  // Show PlayerDashboard for player users
  if (!isAdmin) {
    return (
      <Layout activeTab="home">
        {/* Logout button in header */}
        <div className="absolute top-6 right-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
        <PlayerDashboard />
      </Layout>
    )
  }

  // Admin dashboard with family monitoring
  return (
    <Layout activeTab="home">
      {/* Logout button in header */}
      <div className="absolute top-6 right-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
        >
          <LogOut size={18} />
        </motion.button>
      </div>
      <AdminDashboard />
    </Layout>
  )
}

export default App

