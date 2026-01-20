import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Upload, CheckCircle, AlertTriangle, LogOut } from 'lucide-react'
import Layout from './components/Layout'
import Login from './components/Login'
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
  const { user, isLoading, isAuthenticated, logout } = useUser()
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

  return (
    <Layout activeTab="home">
      {/* Header with user info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-muted text-sm">Welcome back,</p>
          <h1 className="text-xl font-semibold">{user.username}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-2xl px-4 py-2">
            <span className="text-success font-medium">{user.coins}</span>
            <span className="text-muted text-sm ml-1">coins</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Streak Badge */}
      {user.streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-3 mb-4 flex items-center gap-3"
        >
          <div className="text-2xl">🔥</div>
          <div>
            <p className="text-sm font-medium">{user.streak} Day Streak!</p>
            <p className="text-xs text-muted">Keep scanning to maintain it</p>
          </div>
        </motion.div>
      )}

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-6 mb-4"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-muted" />
          </div>
          <h2 className="text-lg font-medium mb-1">Analyze Media</h2>
          <p className="text-muted text-sm mb-4">
            Upload an image or video to detect potential deepfakes
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-success/20 hover:bg-success/30 text-success rounded-2xl font-medium transition-colors"
          >
            Select File
          </motion.button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">Safe</span>
          </div>
          <p className="text-2xl font-semibold">24</p>
          <p className="text-xs text-muted">Verified authentic</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-xs font-medium text-danger">Detected</span>
          </div>
          <p className="text-2xl font-semibold">3</p>
          <p className="text-xs text-muted">Potential fakes</p>
        </motion.div>
      </div>

      {/* Role Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-4 text-center"
      >
        <p className="text-xs text-muted mb-1">Account Type</p>
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium ${user.role === 'admin'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-blue-500/20 text-blue-400'
          }`}>
          {user.role === 'admin' ? '👑 Admin' : '🎮 Player'}
        </span>
      </motion.div>
    </Layout>
  )
}

export default App
