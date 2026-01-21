import { createContext, useContext, useState, useEffect } from 'react'

const AccessibilityContext = createContext(null)

/**
 * Accessibility Provider for elderly-friendly mode
 * Manages large button/text mode preference with localStorage persistence
 */
export function AccessibilityProvider({ children }) {
    // Default to elderly mode (true) for elderly-first experience
    const [isElderlyMode, setIsElderlyMode] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    // Load preference from localStorage on mount
    useEffect(() => {
        const savedPreference = localStorage.getItem('deepfake-shield-elderly-mode')
        if (savedPreference !== null) {
            setIsElderlyMode(savedPreference === 'true')
        }
        setIsLoading(false)
    }, [])

    // Toggle between elderly and normal mode
    const toggleMode = () => {
        const newMode = !isElderlyMode
        setIsElderlyMode(newMode)
        localStorage.setItem('deepfake-shield-elderly-mode', String(newMode))
    }

    const value = {
        isElderlyMode,
        isLoading,
        toggleMode,
    }

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    )
}

/**
 * Hook to access accessibility context
 * @returns {Object} Accessibility context value with isElderlyMode and toggleMode
 */
export function useAccessibility() {
    const context = useContext(AccessibilityContext)
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider')
    }
    return context
}
