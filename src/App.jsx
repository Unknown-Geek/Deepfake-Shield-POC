import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import Layout from './components/Layout'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Layout activeTab={activeTab}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-success/10 mb-4">
          <Shield className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Deepfake Shield</h1>
        <p className="text-muted text-sm">
          AI-powered protection against manipulated media
        </p>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
          transition={{ duration: 0.5, delay: 0.2 }}
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
          transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass rounded-2xl p-4"
      >
        <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { name: 'video_interview.mp4', status: 'safe', time: '2 min ago' },
            { name: 'profile_photo.jpg', status: 'danger', time: '15 min ago' },
            { name: 'presentation.mp4', status: 'safe', time: '1 hour ago' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.status === 'safe' ? 'bg-success' : 'bg-danger'
                  }`} />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-xs text-muted">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </Layout>
  )
}

export default App
