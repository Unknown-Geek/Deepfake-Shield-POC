import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

/**
 * User Provider component that manages authentication state
 * Persists user to localStorage for session persistence
 */
export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('deepfake-shield-user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem('deepfake-shield-user')
            }
        }
        setIsLoading(false)
    }, [])

    // Save user to localStorage when it changes
    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('deepfake-shield-user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('deepfake-shield-user')
    }

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

/**
 * Hook to access user context
 * @returns {Object} User context value
 */
export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
