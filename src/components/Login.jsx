import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Crown, LogIn, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { queryOne } from '../db'
import { useUser } from '../context/UserContext'
import { useToast } from './Toast'

/**
 * Login component with gradient mesh background
 * Features role toggle (Player/Admin) and SQLite authentication
 */
export default function Login() {
    const [role, setRole] = useState('player')
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useUser()
    const toast = useToast()

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!username.trim()) {
            toast.error('Please enter a username')
            return
        }

        setIsLoading(true)

        try {
            // Query SQLite database for user
            const user = queryOne(
                'SELECT * FROM users WHERE username = ? AND role = ?',
                [username.trim(), role]
            )

            if (user) {
                login(user)
                toast.success(`Welcome back, ${user.username}!`)
            } else {
                toast.error('User not found')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 bg-background">
                {/* Primary gradient orbs */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-slate-800/30 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

                {/* Subtle accent */}
                <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-emerald-900/10 rounded-full blur-[60px]" />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-sm"
            >
                <div className="glass rounded-3xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-success/10 mb-4"
                        >
                            <Shield className="w-8 h-8 text-success" />
                        </motion.div>
                        <h1 className="text-2xl font-semibold">Deepfake Shield</h1>
                        <p className="text-muted text-sm mt-1">Sign in to continue</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="mb-6">
                        <div className="glass rounded-2xl p-1 flex">
                            <RoleButton
                                active={role === 'player'}
                                onClick={() => setRole('player')}
                                icon={User}
                                label="Player"
                            />
                            <RoleButton
                                active={role === 'admin'}
                                onClick={() => setRole('admin')}
                                icon={Crown}
                                label="Admin"
                            />
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className={cn(
                                    "w-full px-4 py-3 rounded-2xl",
                                    "bg-white/5 border border-white/10",
                                    "text-foreground placeholder:text-muted/50",
                                    "focus:outline-none focus:border-success/50 focus:bg-white/8",
                                    "transition-all duration-200"
                                )}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Login Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className={cn(
                                "w-full py-3.5 px-4 rounded-2xl font-medium",
                                "flex items-center justify-center gap-2",
                                "bg-success/20 hover:bg-success/30 text-success",
                                "transition-colors duration-200",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Demo Hint */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-muted">
                            Demo accounts: <span className="text-foreground">admin</span> (Admin) or{' '}
                            <span className="text-foreground">Grandma</span> (Player)
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

/**
 * Role toggle button component
 */
function RoleButton({ active, onClick, icon: Icon, label }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2",
                "text-sm font-medium transition-all duration-200",
                active
                    ? "bg-success/20 text-success"
                    : "text-muted hover:text-foreground"
            )}
        >
            <Icon size={18} />
            {label}
            {active && (
                <motion.div
                    layoutId="roleIndicator"
                    className="absolute inset-0 bg-success/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}
        </motion.button>
    )
}
