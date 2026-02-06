import { useState, useEffect } from 'react'

interface UseOfflineReturn {
    isOnline: boolean
    isOffline: boolean
    wasOffline: boolean
    lastOnlineAt: Date | null
}

export function useOffline(): UseOfflineReturn {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    )
    const [wasOffline, setWasOffline] = useState(false)
    const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setLastOnlineAt(new Date())
            if (!isOnline) {
                setWasOffline(true)
                // Reset wasOffline after 5 seconds
                setTimeout(() => setWasOffline(false), 5000)
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Set initial lastOnlineAt if online
        if (navigator.onLine) {
            setLastOnlineAt(new Date())
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [isOnline])

    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline,
        lastOnlineAt
    }
}

export default useOffline
