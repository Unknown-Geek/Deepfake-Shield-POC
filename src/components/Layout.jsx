import { motion, AnimatePresence } from 'framer-motion'
import { Home, Scan, Crown } from 'lucide-react'
import { cn } from '../lib/utils'
import { useUser } from '../context/UserContext'

/**
 * Layout component that wraps the app content
 * - Centers content on desktop (max-w-md mx-auto) to simulate mobile app experience
 * - Features a floating glass bottom navigation bar with blur effect
 * - Navigation: Home, Scan, Admin (admin only)
 */
export default function Layout({ children, activeTab = 'home', onTabChange }) {
    const { isAdmin } = useUser()

    // Navigation items based on user role
    const navItems = isAdmin
        ? [
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'scan', icon: Scan, label: 'Scan' },
            { id: 'admin', icon: Crown, label: 'Admin' },
        ]
        : [
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'scan', icon: Scan, label: 'Scan' },
        ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Main Content Area with Page Transitions */}
            <main className="max-w-md mx-auto pb-28 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Glass Bottom Navigation */}
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={cn(
                        "glass rounded-3xl px-6 py-3",
                        "flex items-center justify-around",
                        "shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                    )}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onTabChange?.(item.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200",
                                    isActive
                                        ? "text-emerald-400"
                                        : "text-muted hover:text-foreground"
                                )}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "transition-all duration-200",
                                        isActive && "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                    )}
                                />
                                <span className={cn(
                                    "text-xs font-medium transition-all duration-200",
                                    isActive && "text-emerald-400"
                                )}>
                                    {item.label}
                                </span>

                                {/* Active indicator with glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavTab"
                                        className="absolute inset-0 bg-emerald-500/10 rounded-2xl -z-10"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        )
                    })}
                </motion.div>
            </nav>
        </div>
    )
}
