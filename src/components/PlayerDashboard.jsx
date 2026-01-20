import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Flame, Scan, Target, Gift, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import { getUserById } from '../db'
import { useUser } from '../context/UserContext'
import Scanner from './Scanner'

/**
 * Player Dashboard with real stats from SQLite
 * Features: Stats header, SCAN NOW button with ripple, Daily Challenge, Scanner integration
 */
export default function PlayerDashboard() {
    const { user } = useUser()
    const [stats, setStats] = useState({ coins: 0, streak: 0 })
    const [showScanner, setShowScanner] = useState(false)

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

    // Refresh stats when returning from scanner
    const handleBackFromScanner = () => {
        refreshStats()
        setShowScanner(false)
    }

    return (
        <div className="min-h-screen bg-background">
            <AnimatePresence mode="wait">
                {showScanner ? (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Scanner Header */}
                        <div className="px-4 pt-6 pb-2 flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBackFromScanner}
                                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </motion.button>
                            <h1 className="text-lg font-semibold">Media Scanner</h1>
                        </div>
                        <Scanner />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Header Stats */}
                        <div className="px-4 pt-6 pb-4">
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

                        {/* Hero - The Scanner */}
                        <div className="flex flex-col items-center justify-center py-12">
                            <motion.button
                                onClick={() => setShowScanner(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative w-48 h-48 rounded-full",
                                    "bg-gradient-to-br from-success/20 to-success/5",
                                    "border-2 border-success/30",
                                    "flex flex-col items-center justify-center gap-2",
                                    "transition-all duration-300",
                                    "shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                                )}
                            >
                                {/* Ripple Animation Rings */}
                                <div className="absolute inset-0 rounded-full">
                                    <span className="absolute inset-0 rounded-full border-2 border-success/20 animate-ping" style={{ animationDuration: '2s' }} />
                                    <span className="absolute inset-4 rounded-full border border-success/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                                    <span className="absolute inset-8 rounded-full border border-success/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                                </div>

                                {/* Button Content */}
                                <Scan className="w-12 h-12 text-success/80" />
                                <span className="text-lg font-semibold text-success">
                                    SCAN NOW
                                </span>
                            </motion.button>

                            <p className="text-muted text-sm mt-6 text-center max-w-xs">
                                Tap to analyze images or videos for potential deepfakes
                            </p>
                        </div>

                        {/* Daily Challenge Card */}
                        <div className="px-4 pb-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass rounded-3xl p-5 overflow-hidden relative"
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
                                        <motion.button
                                            whileHover={{ x: 3 }}
                                            onClick={() => setShowScanner(true)}
                                            className="flex items-center gap-1 text-sm text-success hover:text-success/80 transition-colors"
                                        >
                                            Continue
                                            <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Tips */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass rounded-2xl p-4 mt-4"
                            >
                                <p className="text-xs text-muted text-center">
                                    💡 <span className="text-foreground">Pro Tip:</span> Look for unnatural eye blinking patterns - it's a common deepfake tell!
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
