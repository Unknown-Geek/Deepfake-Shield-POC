import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Filter, CheckCircle, AlertTriangle, HelpCircle, Clock, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { getScanLogsByUser } from '../db'
import { useUser } from '../context/UserContext'

const FILTER_OPTIONS = [
    { id: 'all', label: 'All Scans', icon: History },
    { id: 'safe', label: 'Safe', icon: CheckCircle },
    { id: 'fake', label: 'Threats', icon: AlertTriangle },
    { id: 'uncertain', label: 'Uncertain', icon: HelpCircle },
]

/**
 * Scan History Page
 * Shows past scans with filtering by result type
 */
export default function ScanHistory() {
    const { user } = useUser()
    const [logs, setLogs] = useState([])
    const [filter, setFilter] = useState('all')
    const [showFilterMenu, setShowFilterMenu] = useState(false)

    useEffect(() => {
        if (user?.id) {
            const allLogs = getScanLogsByUser(user.id)
            setLogs(allLogs)
        }
    }, [user?.id])

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => log.result === filter)

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
        return date.toLocaleDateString()
    }

    const getResultIcon = (result) => {
        switch (result) {
            case 'safe': return CheckCircle
            case 'fake': return AlertTriangle
            default: return HelpCircle
        }
    }

    const getResultColor = (result) => {
        switch (result) {
            case 'safe': return 'text-success'
            case 'fake': return 'text-danger'
            default: return 'text-amber-400'
        }
    }

    const activeFilter = FILTER_OPTIONS.find(f => f.id === filter)

    return (
        <div className="pt-6 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold">Scan History</h1>
                    <p className="text-sm text-muted">{filteredLogs.length} scans</p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="glass rounded-2xl px-4 py-2 flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4 text-muted" />
                        <span className="text-sm">{activeFilter?.label}</span>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-muted transition-transform",
                            showFilterMenu && "rotate-180"
                        )} />
                    </motion.button>

                    <AnimatePresence>
                        {showFilterMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 glass rounded-2xl p-2 min-w-[160px] z-50"
                            >
                                {FILTER_OPTIONS.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setFilter(option.id)
                                                setShowFilterMenu(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left",
                                                filter === option.id
                                                    ? "bg-success/20 text-success"
                                                    : "hover:bg-white/5"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm">{option.label}</span>
                                        </button>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Scan List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredLogs.map((log, index) => {
                        const Icon = getResultIcon(log.result)
                        const colorClass = getResultColor(log.result)

                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "glass rounded-2xl p-4 border-l-4",
                                    log.result === 'safe' && "border-l-success",
                                    log.result === 'fake' && "border-l-danger",
                                    log.result === 'uncertain' && "border-l-amber-500"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        log.result === 'safe' && "bg-success/20",
                                        log.result === 'fake' && "bg-danger/20",
                                        log.result === 'uncertain' && "bg-amber-500/20"
                                    )}>
                                        <Icon className={cn("w-5 h-5", colorClass)} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn("text-sm font-medium", colorClass)}>
                                                {log.result === 'safe' ? 'Authentic' :
                                                    log.result === 'fake' ? 'Potential Deepfake' : 'Uncertain'}
                                            </span>
                                            <span className="text-xs text-muted">{log.confidence}%</span>
                                        </div>
                                        <p className="text-xs text-muted mb-2">{log.reason}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(log.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredLogs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-3xl p-8 text-center"
                    >
                        <History className="w-12 h-12 text-muted mx-auto mb-3" />
                        <p className="text-muted">
                            {filter === 'all' ? 'No scans yet' : `No ${filter} scans`}
                        </p>
                        <p className="text-xs text-muted mt-1">
                            Start scanning media to build your history
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
