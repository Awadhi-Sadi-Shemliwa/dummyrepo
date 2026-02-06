import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, User, Users, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('physiotherapist')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const roles: { value: UserRole; label: string; labelSwahili: string; icon: typeof User }[] = [
    { value: 'physiotherapist', label: 'Physiotherapist', labelSwahili: 'Daktari wa Mwili', icon: User },
    { value: 'patient', label: 'Patient', labelSwahili: 'Mgonjwa', icon: Users },
    { value: 'superadmin', label: 'Administrator', labelSwahili: 'Msimamizi', icon: Shield },
  ]

  const demoCredentials = {
    physiotherapist: 'physio@demo.tz',
    patient: 'patient@demo.tz',
    superadmin: 'admin@demo.tz'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields / Tafadhali jaza sehemu zote')
      return
    }

    const success = await login(email, password, role)

    if (success) {
      navigate('/app')
    } else {
      setError('Invalid credentials / Taarifa za kuingia si sahihi')
    }
  }

  const fillDemoCredentials = () => {
    setEmail(demoCredentials[role])
    setPassword('demo123')
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-gradient-orb orb-1"></div>
        <div className="login-gradient-orb orb-2"></div>
        <div className="login-gradient-orb orb-3"></div>
      </div>

      <div className="login-card glass animate-fade-in">
        {/* Logo & Branding */}
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <Activity size={32} />
            </div>
            <div>
              <h1>PhysioConnect</h1>
              <span>Tanzania Digital Health Platform</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="role-selection">
          <p className="role-label">Select your role / Chagua jukumu lako</p>
          <div className="role-buttons">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`role-btn ${role === r.value ? 'active' : ''}`}
                onClick={() => setRole(r.value)}
              >
                <r.icon size={20} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email / Barua pepe</label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password / Neno la siri</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in... / Inaingia...' : 'Sign In / Ingia'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-section">
          <button
            type="button"
            className="btn btn-ghost demo-btn"
            onClick={fillDemoCredentials}
          >
            Use Demo Credentials / Tumia Taarifa za Majaribio
          </button>
          <p className="demo-hint">
            Demo password: <code>demo123</code>
          </p>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>Trusted by healthcare providers across Tanzania</p>
          <p className="login-footer-swahili">Tunaaminika na watoa huduma za afya Tanzania nzima</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          position: relative;
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          inset: 0;
          z-index: -1;
        }

        .login-gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          left: -100px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: var(--secondary);
          bottom: -50px;
          right: -50px;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: var(--accent);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          padding: var(--spacing-2xl);
          border-radius: var(--radius-2xl);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
        }

        .login-logo .logo-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }

        .login-logo h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .login-logo span {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .role-selection {
          margin-bottom: var(--spacing-xl);
        }

        .role-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          text-align: center;
        }

        .role-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-sm);
        }

        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .role-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .role-btn.active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-light);
        }

        .role-btn span {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .login-form {
          margin-bottom: var(--spacing-xl);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--error);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          font-size: 0.875rem;
          text-align: center;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper .input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .login-btn {
          width: 100%;
          padding: var(--spacing-lg);
          font-size: 1rem;
        }

        .demo-section {
          text-align: center;
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--glass-border);
        }

        .demo-btn {
          margin-bottom: var(--spacing-sm);
        }

        .demo-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .demo-hint code {
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          color: var(--secondary);
        }

        .login-footer {
          text-align: center;
          margin-top: var(--spacing-xl);
        }

        .login-footer p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .login-footer-swahili {
          margin-top: var(--spacing-xs) !important;
          font-style: italic;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: var(--spacing-lg);
          }

          .role-buttons {
            grid-template-columns: 1fr;
          }

          .role-btn {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
