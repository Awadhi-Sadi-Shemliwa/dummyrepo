import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    Activity,
    Bell,
    Search,
    Dumbbell,
    LogOut,
    WifiOff,
    Wifi,
    CloudOff
} from 'lucide-react'
import './App.css'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'
import { useOffline } from './hooks/useOffline'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Appointments from './pages/Appointments'
import Exercises from './pages/Exercises'
import SettingsPage from './pages/Settings'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading... / Inapakia...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Main Layout with Sidebar
function MainLayout() {
    const { user, logout, isPhysiotherapist, isPatient, isSuperAdmin } = useAuth()
    const { isOffline, wasOffline } = useOffline()

    // Define nav items based on role
    const getNavItems = () => {
        const baseItems = [
            { path: '/app', icon: LayoutDashboard, label: 'Dashboard', labelSw: 'Dashibodi' },
        ]

        if (isPhysiotherapist() || isSuperAdmin()) {
            return [
                ...baseItems,
                { path: '/app/patients', icon: Users, label: 'Patients', labelSw: 'Wagonjwa' },
                { path: '/app/appointments', icon: Calendar, label: 'Appointments', labelSw: 'Miadi' },
                { path: '/app/exercises', icon: Dumbbell, label: 'Exercises', labelSw: 'Mazoezi' },
                { path: '/app/settings', icon: Settings, label: 'Settings', labelSw: 'Mipangilio' },
            ]
        }

        if (isPatient()) {
            return [
                ...baseItems,
                { path: '/app/exercises', icon: Dumbbell, label: 'My Exercises', labelSw: 'Mazoezi Yangu' },
                { path: '/app/appointments', icon: Calendar, label: 'Appointments', labelSw: 'Miadi' },
                { path: '/app/settings', icon: Settings, label: 'Settings', labelSw: 'Mipangilio' },
            ]
        }

        return baseItems
    }

    const navItems = getNavItems()

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="app-container">
            {/* Offline Banner */}
            {isOffline && (
                <div className="offline-banner">
                    <WifiOff size={16} />
                    <span>You're offline / Huna mtandao - Changes will sync when connected</span>
                </div>
            )}

            {/* Reconnected Banner */}
            {wasOffline && !isOffline && (
                <div className="reconnected-banner">
                    <Wifi size={16} />
                    <span>Back online! Syncing data... / Umerudi mtandaoni! Inasawazisha...</span>
                </div>
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1>PhysioConnect</h1>
                        <span>Tanzania</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            end={item.path === '/app'}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sync Status */}
                {isOffline && (
                    <div className="sync-status">
                        <CloudOff size={16} />
                        <span>Offline Mode</span>
                    </div>
                )}

                {/* User Section */}
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-role">
                                {user?.role === 'physiotherapist' ? 'Physiotherapist' :
                                    user?.role === 'patient' ? 'Patient' : 'Administrator'}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Top Bar */}
                <div className="top-bar">
                    <div className="search-input" style={{ flex: 1, maxWidth: '400px' }}>
                        <Search />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search / Tafuta..."
                        />
                    </div>
                    <div className="top-bar-actions">
                        <button className="btn btn-ghost notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>
                    </div>
                </div>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/app/*"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    )
}

export default App
