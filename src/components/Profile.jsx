import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Coins, Flame, Shield, Award, Target, Zap, Eye, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { getUserById, getScanLogsByUser } from '../db'
import { useUser } from '../context/UserContext'
import { useToast } from './Toast'

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_scan', name: 'First Scan', description: 'Complete your first scan', icon: Shield, requirement: (stats) => stats.totalScans >= 1 },
    { id: 'scanner_5', name: 'Vigilant', description: 'Complete 5 scans', icon: Eye, requirement: (stats) => stats.totalScans >= 5 },
    { id: 'scanner_10', name: 'Guardian', description: 'Complete 10 scans', icon: Target, requirement: (stats) => stats.totalScans >= 10 },
    { id: 'fake_finder', name: 'Fake Finder', description: 'Detect your first deepfake', icon: Zap, requirement: (stats) => stats.fakesFound >= 1 },
    { id: 'streak_3', name: 'Consistent', description: 'Maintain a 3-day streak', icon: Flame, requirement: (stats) => stats.streak >= 3 },
    { id: 'streak_7', name: 'Dedicated', description: 'Maintain a 7-day streak', icon: Award, requirement: (stats) => stats.streak >= 7 },
]

/**
 * Profile Page
 * Shows user stats, achievements, and account settings
 */
export default function Profile() {
    const { user, logout } = useUser()
    const toast = useToast()
    const [stats, setStats] = useState({
        coins: 0,
        streak: 0,
        totalScans: 0,
        safeScans: 0,
        fakesFound: 0,
    })

    useEffect(() => {
        if (user?.id) {
            fetchStats()
        }
    }, [user?.id])

    const fetchStats = () => {
        const freshUser = getUserById(user.id)
        const logs = getScanLogsByUser(user.id)

        const safeScans = logs.filter(l => l.result === 'safe').length
        const fakesFound = logs.filter(l => l.result === 'fake').length

        setStats({
            coins: freshUser?.coins || 0,
            streak: freshUser?.streak || 0,
            totalScans: logs.length,
            safeScans,
            fakesFound,
        })
    }

    const unlockedAchievements = ACHIEVEMENTS.filter(a => a.requirement(stats))
    const lockedAchievements = ACHIEVEMENTS.filter(a => !a.requirement(stats))

    const handleLogout = () => {
        logout()
        toast.info('Logged out successfully')
    }

    return (
        <div className="pt-6 px-4 pb-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 mb-6 text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h1 className="text-xl font-semibold mb-1">{user?.username}</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-500/20 text-blue-400 text-sm">
                    {user?.role === 'admin' ? '👑 Admin' : '🎮 Player'}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-4 text-center"
                >
                    <Coins className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <p className="text-xl font-semibold">{stats.coins}</p>
                    <p className="text-xs text-muted">Coins</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass rounded-2xl p-4 text-center"
                >
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                    <p className="text-xl font-semibold">{stats.streak}</p>
                    <p className="text-xs text-muted">Streak</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-4 text-center"
                >
                    <Shield className="w-5 h-5 text-success mx-auto mb-2" />
                    <p className="text-xl font-semibold">{stats.totalScans}</p>
                    <p className="text-xs text-muted">Scans</p>
                </motion.div>
            </div>

            {/* Scan Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-4 mb-6"
            >
                <h3 className="text-sm font-medium mb-3">Scan Statistics</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Safe scans</span>
                        <span className="text-sm text-success font-medium">{stats.safeScans}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Threats detected</span>
                        <span className="text-sm text-danger font-medium">{stats.fakesFound}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Detection rate</span>
                        <span className="text-sm font-medium">
                            {stats.totalScans > 0
                                ? `${Math.round((stats.fakesFound / stats.totalScans) * 100)}%`
                                : '0%'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
            >
                <h3 className="text-sm font-medium mb-3">
                    Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                </h3>

                <div className="grid grid-cols-3 gap-3">
                    {ACHIEVEMENTS.map((achievement, index) => {
                        const Icon = achievement.icon
                        const isUnlocked = achievement.requirement(stats)

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + index * 0.05 }}
                                className={cn(
                                    "glass rounded-2xl p-3 text-center transition-all",
                                    isUnlocked
                                        ? "border border-success/30"
                                        : "opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2",
                                    isUnlocked ? "bg-success/20" : "bg-white/5"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isUnlocked ? "text-success" : "text-muted"
                                    )} />
                                </div>
                                <p className="text-xs font-medium truncate">{achievement.name}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="text-sm font-medium mb-3">Account</h3>

                <button
                    onClick={handleLogout}
                    className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-danger" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Log Out</p>
                        <p className="text-xs text-muted">Sign out of your account</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted" />
                </button>
            </motion.div>
        </div>
    )
}
