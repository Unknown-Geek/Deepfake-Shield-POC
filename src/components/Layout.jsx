import { motion } from 'framer-motion'
import { Home, Shield, Settings, User } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * Layout component that wraps the app content
 * - Centers content on desktop (max-w-md mx-auto) to simulate mobile app experience
 * - Features a floating bottom navigation bar with blur effect
 */
export default function Layout({ children, activeTab = 'home' }) {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'scan', icon: Shield, label: 'Scan' },
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Main Content Area */}
            <main className="max-w-md mx-auto pb-24 px-4 pt-6">
                {children}
            </main>

            {/* Floating Bottom Navigation */}
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={cn(
                        "glass rounded-3xl px-4 py-3",
                        "flex items-center justify-around"
                    )}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors",
                                    isActive
                                        ? "text-success"
                                        : "text-muted hover:text-foreground"
                                )}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-xs font-medium">{item.label}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-success/10 rounded-2xl -z-10"
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
