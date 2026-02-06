import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, UserRole, Physiotherapist, Patient } from '../types'

// Demo users for testing different roles
const DEMO_USERS: Record<string, User | Physiotherapist | Patient> = {
    'physio@demo.tz': {
        id: 'physio-001',
        email: 'physio@demo.tz',
        firstName: 'Dr. Rehema',
        lastName: 'Mwangi',
        phone: '+255 712 345 678',
        role: 'physiotherapist',
        licenseNumber: 'PT-TZ-2024-001',
        specializations: ['Sports Injury', 'Chronic Pain', 'Post-Surgery Rehab'],
        clinic: 'PhysioConnect Clinic',
        address: '123 Samora Avenue',
        city: 'Dar es Salaam',
        patients: ['patient-001', 'patient-002', 'patient-003'],
        workingHours: {
            start: '08:00',
            end: '17:00',
            days: [1, 2, 3, 4, 5]
        },
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-02-06T00:00:00Z'
    } as Physiotherapist,

    'patient@demo.tz': {
        id: 'patient-001',
        email: 'patient@demo.tz',
        firstName: 'John',
        lastName: 'Mwamba',
        phone: '+255 756 789 012',
        role: 'patient',
        dateOfBirth: '1980-05-15',
        gender: 'Male',
        address: '45 Uhuru Street',
        city: 'Dar es Salaam',
        emergencyContact: {
            name: 'Mary Mwamba',
            phone: '+255 789 012 345',
            relationship: 'Spouse'
        },
        assignedPhysiotherapist: 'physio-001',
        currentCondition: 'Lower Back Pain',
        medicalHistory: ['Herniated disc', 'Previous knee surgery'],
        status: 'Active',
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-06T00:00:00Z'
    } as Patient,

    'admin@demo.tz': {
        id: 'admin-001',
        email: 'admin@demo.tz',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+255 700 000 000',
        role: 'superadmin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-02-06T00:00:00Z'
    } as User
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string, role: UserRole) => Promise<boolean>
    logout: () => void
    isPhysiotherapist: () => boolean
    isPatient: () => boolean
    isSuperAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('physioconnect_user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem('physioconnect_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, _password: string, role: UserRole): Promise<boolean> => {
        setIsLoading(true)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Demo login - in production, this would call the actual API
        const demoUser = DEMO_USERS[email]

        if (demoUser && demoUser.role === role) {
            setUser(demoUser)
            localStorage.setItem('physioconnect_user', JSON.stringify(demoUser))
            localStorage.setItem('auth_token', 'demo-token-' + Date.now())
            setIsLoading(false)
            return true
        }

        // For demo, allow any email with matching role
        const fallbackUser: User = {
            id: 'user-' + Date.now(),
            email,
            firstName: role === 'physiotherapist' ? 'Dr.' : '',
            lastName: email.split('@')[0],
            phone: '+255 700 000 000',
            role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setUser(fallbackUser)
        localStorage.setItem('physioconnect_user', JSON.stringify(fallbackUser))
        localStorage.setItem('auth_token', 'demo-token-' + Date.now())
        setIsLoading(false)
        return true
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('physioconnect_user')
        localStorage.removeItem('auth_token')
    }

    const isPhysiotherapist = () => user?.role === 'physiotherapist'
    const isPatient = () => user?.role === 'patient'
    const isSuperAdmin = () => user?.role === 'superadmin'

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            isPhysiotherapist,
            isPatient,
            isSuperAdmin
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
