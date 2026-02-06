import { useState } from 'react'
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Database,
    HelpCircle,
    ChevronRight,
    Moon,
    Sun,
    Save
} from 'lucide-react'

function Settings() {
    const [activeTab, setActiveTab] = useState('profile')
    const [darkMode, setDarkMode] = useState(true)
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        appointments: true,
        updates: true
    })

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'language', label: 'Language & Region', icon: Globe },
        { id: 'data', label: 'Data & Storage', icon: Database },
        { id: 'help', label: 'Help & Support', icon: HelpCircle },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and application settings</p>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '280px 1fr' }}>
                {/* Settings Navigation */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                            >
                                <tab.icon size={18} />
                                <span style={{ flex: 1, textAlign: 'left' }}>{tab.label}</span>
                                <ChevronRight size={16} style={{ opacity: activeTab === tab.id ? 1 : 0.3 }} />
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="card">
                    {activeTab === 'profile' && (
                        <div>
                            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-xl)' }}>Profile Settings</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                                <div className="avatar large">DR</div>
                                <div>
                                    <button className="btn btn-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>Change Photo</button>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, GIF or PNG. Max size of 2MB</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                                <div className="input-group">
                                    <label className="input-label">First Name</label>
                                    <input type="text" className="input" defaultValue="Dr. Rehema" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Last Name</label>
                                    <input type="text" className="input" defaultValue="Mwangi" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input type="email" className="input" defaultValue="rehema@physioconnect.tz" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone</label>
                                    <input type="tel" className="input" defaultValue="+255 712 345 678" />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Bio</label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        defaultValue="Licensed physiotherapist with 10+ years of experience specializing in sports injuries and rehabilitation."
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--glass-border)' }}>
                                <button className="btn btn-primary">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-xl)' }}>Notification Preferences</h3>

                            {[
                                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                                { key: 'appointments', label: 'Appointment Reminders', desc: 'Get reminded about upcoming appointments' },
                                { key: 'updates', label: 'Product Updates', desc: 'News about product and feature updates' },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-lg)',
                                        borderBottom: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                        style={{
                                            width: '48px',
                                            height: '28px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: notifications[item.key as keyof typeof notifications] ? 'var(--primary)' : 'var(--bg-tertiary)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            top: '4px',
                                            left: notifications[item.key as keyof typeof notifications] ? '24px' : '4px',
                                            transition: 'left var(--transition-fast)'
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div>
                            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-xl)' }}>Appearance Settings</h3>

                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Theme</div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                    <button
                                        className={`btn ${!darkMode ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setDarkMode(false)}
                                    >
                                        <Sun size={18} />
                                        Light
                                    </button>
                                    <button
                                        className={`btn ${darkMode ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setDarkMode(true)}
                                    >
                                        <Moon size={18} />
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Accent Color</div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                    {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                                        <button
                                            key={color}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-md)',
                                                background: color,
                                                border: color === '#6366f1' ? '3px solid white' : 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!['profile', 'notifications', 'appearance'].includes(activeTab) && (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>🚧</div>
                            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Coming Soon</h3>
                            <p style={{ color: 'var(--text-muted)' }}>This section is under development</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
