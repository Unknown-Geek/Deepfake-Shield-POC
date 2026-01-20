import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUserById } from '../db'
import { useUser } from './UserContext'

const StatsContext = createContext(null)

/**
 * Stats Provider for real-time coin and streak updates
 */
export function StatsProvider({ children }) {
    const { user } = useUser()
    const [stats, setStats] = useState({ coins: 0, streak: 0 })

    // Fetch stats when user changes
    useEffect(() => {
        if (user?.id) {
            refreshStats()
        } else {
            setStats({ coins: 0, streak: 0 })
        }
    }, [user?.id])

    // Refresh stats from database
    const refreshStats = useCallback(() => {
        if (user?.id) {
            const freshUser = getUserById(user.id)
            if (freshUser) {
                setStats({ coins: freshUser.coins, streak: freshUser.streak })
            }
        }
    }, [user?.id])

    const value = {
        coins: stats.coins,
        streak: stats.streak,
        refreshStats,
    }

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    )
}

/**
 * Hook to access stats context
 */
export function useStats() {
    const context = useContext(StatsContext)
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider')
    }
    return context
}
