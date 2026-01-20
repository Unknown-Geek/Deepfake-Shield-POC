import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '../lib/utils'

const ToastContext = createContext(null)

/**
 * Toast Provider component
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = ({ message, type = 'info', duration = 4000 }) => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, type }])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const toast = {
        success: (message) => addToast({ message, type: 'success' }),
        error: (message) => addToast({ message, type: 'error' }),
        info: (message) => addToast({ message, type: 'info' }),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

/**
 * Hook to access toast functions
 */
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

/**
 * Toast container component
 */
function ToastContainer({ toasts, removeToast }) {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    }

    const colors = {
        success: 'text-success border-success/30 bg-success/10',
        error: 'text-danger border-danger/30 bg-danger/10',
        info: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = icons[toast.type]
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={cn(
                                'glass rounded-2xl px-4 py-3 flex items-center gap-3 border',
                                colors[toast.type]
                            )}
                        >
                            <Icon size={18} />
                            <span className="text-sm font-medium flex-1">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-muted hover:text-foreground transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
