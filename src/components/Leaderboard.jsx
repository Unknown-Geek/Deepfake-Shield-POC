import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, User, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'
import { getAllUsers, getScanLogsByUser } from '../db'
import { useUser } from '../context/UserContext'

/**
 * Leaderboard Page
 * Shows ranking of players by coins and scans
 */
export default function Leaderboard() {
    const { user } = useUser()
    const [players, setPlayers] = useState([])
    const [sortBy, setSortBy] = useState('coins') // 'coins' or 'scans'

    useEffect(() => {
        loadLeaderboard()
    }, [sortBy])

    const loadLeaderboard = () => {
        const allUsers = getAllUsers()

        // Get stats for each player
        const playersWithStats = allUsers
            .filter(u => u.role === 'player')
            .map(player => {
                const logs = getScanLogsByUser(player.id)
                return {
                    ...player,
                    totalScans: logs.length,
                    fakesFound: logs.filter(l => l.result === 'fake').length,
                }
            })
            .sort((a, b) => {
                if (sortBy === 'coins') return b.coins - a.coins
                return b.totalScans - a.totalScans
            })

        setPlayers(playersWithStats)
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-amber-400" />
            case 2: return <Medal className="w-6 h-6 text-gray-300" />
            case 3: return <Medal className="w-6 h-6 text-amber-600" />
            default: return <span className="text-lg font-bold text-muted">#{rank}</span>
        }
    }

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30'
            case 2: return 'bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20'
            case 3: return 'bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20'
            default: return 'border-white/5'
        }
    }

    return (
        <div className="pt-6 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold">Leaderboard</h1>
                    <p className="text-sm text-muted">Top defenders against deepfakes</p>
                </div>

                {/* Sort Toggle */}
                <div className="glass rounded-2xl p-1 flex gap-1">
                    <button
                        onClick={() => setSortBy('coins')}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-sm transition-colors",
                            sortBy === 'coins'
                                ? "bg-success/20 text-success"
                                : "text-muted hover:text-foreground"
                        )}
                    >
                        Coins
                    </button>
                    <button
                        onClick={() => setSortBy('scans')}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-sm transition-colors",
                            sortBy === 'scans'
                                ? "bg-success/20 text-success"
                                : "text-muted hover:text-foreground"
                        )}
                    >
                        Scans
                    </button>
                </div>
            </div>

            {/* Trophy Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 mb-6 text-center"
            >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Weekly Champions</h2>
                <p className="text-sm text-muted">
                    Compete to become the top deepfake detector!
                </p>
            </motion.div>

            {/* Leaderboard List */}
            <div className="space-y-3">
                {players.map((player, index) => {
                    const rank = index + 1
                    const isCurrentUser = player.id === user?.id

                    return (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "glass rounded-2xl p-4 flex items-center gap-4 border",
                                getRankBg(rank),
                                isCurrentUser && "ring-2 ring-success/50"
                            )}
                        >
                            {/* Rank */}
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                {getRankIcon(rank)}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {player.username}
                                    </span>
                                    {isCurrentUser && (
                                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                                            You
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted">
                                    <span>{player.totalScans} scans</span>
                                    <span>•</span>
                                    <span>{player.fakesFound} fakes found</span>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <p className={cn(
                                    "text-lg font-semibold",
                                    rank <= 3 ? "text-amber-400" : "text-foreground"
                                )}>
                                    {sortBy === 'coins' ? player.coins : player.totalScans}
                                </p>
                                <p className="text-xs text-muted">
                                    {sortBy === 'coins' ? 'coins' : 'scans'}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}

                {players.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-3xl p-8 text-center"
                    >
                        <TrendingUp className="w-12 h-12 text-muted mx-auto mb-3" />
                        <p className="text-muted">No players yet</p>
                        <p className="text-xs text-muted mt-1">
                            Be the first to start scanning!
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
