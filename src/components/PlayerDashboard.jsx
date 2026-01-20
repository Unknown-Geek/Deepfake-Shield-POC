import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, Flame, Scan, Target, Gift, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { getUserById } from '../db'
import { useUser } from '../context/UserContext'

/**
 * Player Dashboard with real stats from SQLite
 * Features: Stats header, SCAN NOW button with ripple, Daily Challenge
 */
export default function PlayerDashboard() {
    const { user } = useUser()
    const [stats, setStats] = useState({ coins: 0, streak: 0 })

    // Fetch fresh stats from database
    useEffect(() => {
        if (user?.id) {
            refreshStats()
        }
    }, [user?.id])

    const refreshStats = () => {
        if (user?.id) {
            const freshUser = getUserById(user.id)
            if (freshUser) {
                setStats({ coins: freshUser.coins, streak: freshUser.streak })
            }
        }
    }

    return (
        <div className="pt-6 px-4">
            {/* Header Stats */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-muted text-sm">Good evening,</p>
                        <h1 className="text-xl font-semibold">{user?.username || 'Player'}</h1>
                    </div>
                </div>

                {/* Stats Chips */}
                <div className="flex gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl px-4 py-3 flex items-center gap-3 flex-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{stats.coins}</p>
                            <p className="text-xs text-muted">Coins</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl px-4 py-3 flex items-center gap-3 flex-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{stats.streak}</p>
                            <p className="text-xs text-muted">Day Streak</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hero - Quick Scan Prompt */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-3xl p-6 mb-4 text-center"
            >
                <div className="w-16 h-16 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Scan className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Ready to Scan?</h2>
                <p className="text-sm text-muted mb-4">
                    Tap the Scan icon below to analyze images or videos for potential deepfakes
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    System Ready
                </div>
            </motion.div>

            {/* Daily Challenge Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-3xl p-5 overflow-hidden relative mb-4"
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Target className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-purple-400">Daily Challenge</span>
                    </div>

                    {/* Challenge Content */}
                    <h3 className="text-lg font-semibold mb-2">Spot the Fake!</h3>
                    <p className="text-sm text-muted mb-4">
                        Analyze 3 images today and earn bonus coins. Can you identify which ones are real?
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted">Progress</span>
                            <span className="text-foreground font-medium">1/3 completed</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '33%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-muted">Reward:</span>
                            <span className="text-sm font-medium text-amber-400">+50 Coins</span>
                        </div>
                        <motion.div
                            whileHover={{ x: 3 }}
                            className="flex items-center gap-1 text-sm text-success"
                        >
                            Start
                            <ChevronRight className="w-4 h-4" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-4"
            >
                <p className="text-xs text-muted text-center">
                    💡 <span className="text-foreground">Pro Tip:</span> Look for unnatural eye blinking patterns - it's a common deepfake tell!
                </p>
            </motion.div>
        </div>
    )
}
