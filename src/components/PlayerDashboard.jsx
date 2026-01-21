import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Coins, Flame, Scan, Target, Gift, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { getUserById } from '../db'
import { useUser } from '../context/UserContext'
import { useAccessibility } from '../context/AccessibilityContext'

/**
 * Player Dashboard with real stats from SQLite
 * Features: Stats header, SCAN NOW button with ripple, Daily Challenge
 */
export default function PlayerDashboard({ onScanClick, onFileSelect }) {
    const { user } = useUser()
    const { isElderlyMode } = useAccessibility()
    const [stats, setStats] = useState({ coins: 0, streak: 0 })
    const fileInputRef = useRef(null)

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

    // Handle SCAN NOW click - direct file pick in elderly mode
    const handleScanClick = () => {
        if (isElderlyMode) {
            // Open file picker directly
            fileInputRef.current?.click()
        } else {
            // Navigate to scan page
            onScanClick?.()
        }
    }

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            onFileSelect?.(file)
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

                {/* Stats Chips - Smaller in Elderly Mode */}
                <div className="flex gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "glass rounded-2xl flex items-center gap-3 flex-1",
                            isElderlyMode ? "px-3 py-2" : "px-4 py-3"
                        )}
                    >
                        <div className={cn(
                            "rounded-xl bg-amber-500/20 flex items-center justify-center",
                            isElderlyMode ? "w-8 h-8" : "w-10 h-10"
                        )}>
                            <Coins className={cn(isElderlyMode ? "w-4 h-4" : "w-5 h-5", "text-amber-400")} />
                        </div>
                        <div>
                            <p className={cn("font-semibold", isElderlyMode ? "text-xl" : "text-2xl")}>{stats.coins}</p>
                            <p className="text-xs text-muted">Coins</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(
                            "glass rounded-2xl flex items-center gap-3 flex-1",
                            isElderlyMode ? "px-3 py-2" : "px-4 py-3"
                        )}
                    >
                        <div className={cn(
                            "rounded-xl bg-orange-500/20 flex items-center justify-center",
                            isElderlyMode ? "w-8 h-8" : "w-10 h-10"
                        )}>
                            <Flame className={cn(isElderlyMode ? "w-4 h-4" : "w-5 h-5", "text-orange-400")} />
                        </div>
                        <div>
                            <p className={cn("font-semibold", isElderlyMode ? "text-xl" : "text-2xl")}>{stats.streak}</p>
                            <p className="text-xs text-muted">Day Streak</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hero - SCAN NOW Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-3xl p-6 mb-4 text-center"
            >
                <motion.button
                    onClick={handleScanClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-6 rounded-2xl font-semibold text-lg",
                        "bg-gradient-to-r from-success to-emerald-400",
                        "text-background flex items-center justify-center gap-3",
                        "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                        "transition-all duration-300",
                        isElderlyMode && "scan-btn-pulse py-8 text-xl"
                    )}
                >
                    <Scan className={cn("w-7 h-7", isElderlyMode && "w-9 h-9")} />
                    SCAN NOW
                </motion.button>
                <p className="text-sm text-muted mt-4">
                    Tap to analyze images or videos for deepfakes
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-success mt-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    System Ready
                </div>
            </motion.div>

            {/* Hidden file input for elderly mode direct scan */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Daily Challenge Card - Hidden in Elderly Mode */}
            {!isElderlyMode && (
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
            )}

            {/* Quick Tips - Hidden in Elderly Mode */}
            {!isElderlyMode && (
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
            )}
        </div>
    )
}

