import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronRight, X, Shield, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { cn } from '../lib/utils'
import { queryAll, queryOne } from '../db'
import { useUser } from '../context/UserContext'

/**
 * Admin Dashboard with family member scan monitoring
 * Features: Family list with status dots, detail drawer with scan logs
 */
export default function AdminDashboard() {
    const { user } = useUser()
    const [familyMembers, setFamilyMembers] = useState([])
    const [selectedMember, setSelectedMember] = useState(null)
    const [memberLogs, setMemberLogs] = useState([])

    // Fetch family members (all non-admin users) with their latest scan
    useEffect(() => {
        fetchFamilyMembers()
    }, [])

    const fetchFamilyMembers = () => {
        // Get all player users
        const players = queryAll("SELECT * FROM users WHERE role = 'player'")

        // For each player, get their latest scan log
        const membersWithStatus = players.map((player) => {
            const latestScan = queryOne(
                `SELECT * FROM scan_logs 
         WHERE user_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 1`,
                [player.id]
            )

            return {
                ...player,
                latestScan,
                hasAlert: latestScan?.result === 'fake',
            }
        })

        setFamilyMembers(membersWithStatus)
    }

    const openMemberDetails = (member) => {
        setSelectedMember(member)

        // Fetch all scan logs for this member
        const logs = queryAll(
            `SELECT * FROM scan_logs 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 10`,
            [member.id]
        )
        setMemberLogs(logs)
    }

    const closeMemberDetails = () => {
        setSelectedMember(null)
        setMemberLogs([])
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000)
            return `${mins} min ago`
        }
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        }
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000)
            return `${days} day${days > 1 ? 's' : ''} ago`
        }
        // Otherwise show date
        return date.toLocaleDateString()
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-muted text-sm">Admin Panel</p>
                        <h1 className="text-xl font-semibold">Family Protection</h1>
                    </div>
                    <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">{familyMembers.length} Members</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-success" />
                            <span className="text-xs text-muted">Total Scans</span>
                        </div>
                        <p className="text-2xl font-semibold">
                            {familyMembers.reduce((acc, m) => acc + (m.latestScan ? 1 : 0), 0)}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-danger" />
                            <span className="text-xs text-muted">Alerts</span>
                        </div>
                        <p className="text-2xl font-semibold">
                            {familyMembers.filter((m) => m.hasAlert).length}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Family Members List */}
            <div className="px-4">
                <h2 className="text-sm font-medium text-muted mb-3">Family Members</h2>

                <div className="space-y-3">
                    {familyMembers.map((member, index) => (
                        <motion.button
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => openMemberDetails(member)}
                            className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors text-left"
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <span className="text-lg font-semibold">
                                        {member.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Status Dot */}
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                                    member.hasAlert
                                        ? "bg-danger animate-pulse"
                                        : member.latestScan
                                            ? "bg-success"
                                            : "bg-muted"
                                )} />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="font-medium">{member.username}</p>
                                <p className="text-sm text-muted">
                                    {member.latestScan
                                        ? `Last scan: ${formatDate(member.latestScan.timestamp)}`
                                        : 'No scans yet'
                                    }
                                </p>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="w-5 h-5 text-muted" />
                        </motion.button>
                    ))}

                    {familyMembers.length === 0 && (
                        <div className="glass rounded-2xl p-8 text-center">
                            <Users className="w-12 h-12 text-muted mx-auto mb-3" />
                            <p className="text-muted">No family members found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selectedMember && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMemberDetails}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-10 h-1 bg-white/20 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <span className="text-xl font-semibold">
                                                {selectedMember.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                                            selectedMember.hasAlert ? "bg-danger" : "bg-success"
                                        )} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">{selectedMember.username}</h2>
                                        <p className="text-sm text-muted">
                                            {selectedMember.coins} coins • {selectedMember.streak} day streak
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeMemberDetails}
                                    className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scan Logs */}
                            <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
                                <h3 className="text-sm font-medium text-muted mb-3">Recent Scans</h3>

                                <div className="space-y-3">
                                    {memberLogs.map((log, index) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "glass rounded-2xl p-4 border-l-4",
                                                log.result === 'fake'
                                                    ? "border-l-danger"
                                                    : log.result === 'safe'
                                                        ? "border-l-success"
                                                        : "border-l-amber-500"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {log.result === 'fake' ? (
                                                        <AlertTriangle className="w-4 h-4 text-danger" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                    )}
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        log.result === 'fake' ? "text-danger" : "text-success"
                                                    )}>
                                                        {log.result === 'fake' ? 'Potential Deepfake' : 'Authentic'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted">
                                                    {log.confidence}%
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted mb-2">{log.reason}</p>

                                            <div className="flex items-center gap-2 text-xs text-muted">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDate(log.timestamp)}</span>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {memberLogs.length === 0 && (
                                        <div className="glass rounded-2xl p-6 text-center">
                                            <Shield className="w-10 h-10 text-muted mx-auto mb-2" />
                                            <p className="text-sm text-muted">No scan history</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
