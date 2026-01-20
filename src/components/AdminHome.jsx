import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Activity, TrendingUp, AlertTriangle, CheckCircle, Scan } from 'lucide-react'
import { cn } from '../lib/utils'
import { queryAll, queryOne } from '../db'
import { useUser } from '../context/UserContext'

/**
 * Admin Home Dashboard with overview stats
 * Different from AdminDashboard which shows family monitoring
 */
export default function AdminHome() {
    const { user } = useUser()
    const [stats, setStats] = useState({
        totalScans: 0,
        safeScans: 0,
        fakeScans: 0,
        familyMembers: 0,
        recentAlerts: [],
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = () => {
        // Get total scans
        const totalScans = queryOne('SELECT COUNT(*) as count FROM scan_logs')
        const safeScans = queryOne("SELECT COUNT(*) as count FROM scan_logs WHERE result = 'safe'")
        const fakeScans = queryOne("SELECT COUNT(*) as count FROM scan_logs WHERE result = 'fake'")
        const familyMembers = queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'player'")

        // Get recent fake alerts
        const recentAlerts = queryAll(`
      SELECT sl.*, u.username 
      FROM scan_logs sl 
      JOIN users u ON sl.user_id = u.id 
      WHERE sl.result = 'fake' 
      ORDER BY sl.timestamp DESC 
      LIMIT 3
    `)

        setStats({
            totalScans: totalScans?.count || 0,
            safeScans: safeScans?.count || 0,
            fakeScans: fakeScans?.count || 0,
            familyMembers: familyMembers?.count || 0,
            recentAlerts,
        })
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000)
            return `${mins}m ago`
        }
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000)
            return `${hours}h ago`
        }
        return date.toLocaleDateString()
    }

    return (
        <div className="pt-6 px-4">
            {/* Header */}
            <div className="mb-6">
                <p className="text-muted text-sm">Welcome back,</p>
                <h1 className="text-xl font-semibold">{user?.username || 'Admin'} 👑</h1>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-muted">Total Scans</span>
                    </div>
                    <p className="text-2xl font-semibold">{stats.totalScans}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass rounded-2xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-muted">Family Members</span>
                    </div>
                    <p className="text-2xl font-semibold">{stats.familyMembers}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-xs text-muted">Safe</span>
                    </div>
                    <p className="text-2xl font-semibold text-success">{stats.safeScans}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass rounded-2xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-danger" />
                        <span className="text-xs text-muted">Threats</span>
                    </div>
                    <p className="text-2xl font-semibold text-danger">{stats.fakeScans}</p>
                </motion.div>
            </div>

            {/* Protection Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-3xl p-6 mb-4"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                        stats.fakeScans > 0 ? "bg-amber-500/20" : "bg-success/20"
                    )}>
                        <Shield className={cn(
                            "w-8 h-8",
                            stats.fakeScans > 0 ? "text-amber-400" : "text-success"
                        )} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">
                            {stats.fakeScans > 0 ? 'Threats Detected' : 'All Clear'}
                        </h2>
                        <p className="text-sm text-muted">
                            {stats.fakeScans > 0
                                ? `${stats.fakeScans} potential deepfake(s) found`
                                : 'Your family is protected'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Recent Alerts */}
            {stats.recentAlerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-4"
                >
                    <h3 className="text-sm font-medium text-muted mb-3">Recent Alerts</h3>
                    <div className="space-y-2">
                        {stats.recentAlerts.map((alert, index) => (
                            <div
                                key={alert.id}
                                className="glass rounded-2xl p-4 border-l-4 border-l-danger"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{alert.username}</span>
                                    <span className="text-xs text-muted">{formatDate(alert.timestamp)}</span>
                                </div>
                                <p className="text-xs text-muted">{alert.reason}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                        <Scan className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Quick Tip</p>
                        <p className="text-xs text-muted">Use the Admin tab to monitor family member scans</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-muted" />
                </div>
            </motion.div>
        </div>
    )
}
