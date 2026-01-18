import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckSquare, Users, LogOut,
  Plus, Bell, Menu, X, Calendar, Clock, MessageSquare,
  TrendingUp, AlertTriangle, Activity, DollarSign, Building2,
  Edit2, Trash2, ChevronRight, Settings, BarChart3, Briefcase,
  User, Target
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { authAPI, usersAPI, contractsAPI, tasksAPI, dashboardAPI } from './api';
import './App.css';

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('arc_token');
    const storedUser = localStorage.getItem('arc_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      authAPI.getMe().then(res => {
        setUser(res.data);
        localStorage.setItem('arc_user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('arc_token');
        localStorage.removeItem('arc_user');
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('arc_token', res.data.access_token);
    localStorage.setItem('arc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('arc_token');
    localStorage.removeItem('arc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ==================== LOADING SCREEN ====================
const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
    <div className="spinner"></div>
  </div>
);

// ==================== FORMAT CURRENCY ====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

// ==================== LOGIN PAGE ====================
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/images/logo.png" alt="ARC Logo" style={{ height: '60px', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#212529' }}>Project Management System</h1>
          <p style={{ color: '#6C757D', fontSize: '14px' }}>Sign in to manage contracts and tasks</p>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#C62828', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#495057', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your email"
              required
              data-testid="login-email"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#495057', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
              data-testid="login-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading} data-testid="login-submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#F8F9FA', borderRadius: '8px', fontSize: '13px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', color: '#B8860B' }}>Test Credentials:</p>
          <p style={{ color: '#6C757D' }}><strong>CEO:</strong> sadi@arc.com / 12345678</p>
          <p style={{ color: '#6C757D' }}><strong>Finance:</strong> maureen.bangu@ar-consurt-world.com / 12345678</p>
          <p style={{ color: '#6C757D' }}><strong>Operations:</strong> juma.h.kasele@gmail.com / 11223344</p>
        </div>
      </div>
    </div>
  );
};

// ==================== SIDEBAR ====================
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ceo', 'finance', 'operations', 'worker'] },
      { path: '/contracts', icon: FileText, label: 'Contracts', roles: ['ceo', 'finance', 'operations'] },
      { path: '/tasks', icon: CheckSquare, label: 'Task Board', roles: ['ceo', 'finance', 'operations', 'worker'] },
      { path: '/team', icon: Users, label: 'Team', roles: ['ceo', 'operations'] },
    ];
    return items.filter(item => item.roles.includes(user?.role));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="modal-overlay" style={{ zIndex: 39 }} onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="ARC" style={{ height: '40px' }} />
        </div>

        <nav className="sidebar-nav">
          {getNavItems().map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #DEE2E6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', marginBottom: '12px' }}>
            <img src={user?.avatar} alt={user?.name} className="avatar" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', color: '#B22222' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// ==================== HEADER ====================
const Header = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onMenuClick} className="btn btn-secondary menu-toggle" style={{ padding: '8px', display: 'none' }}>
            <Menu size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#212529' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <img src={user?.avatar} alt={user?.name} className="avatar" />
        </div>
      </div>
    </header>
  );
};

// ==================== CEO EXECUTIVE DASHBOARD ====================
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, contractsRes, activitiesRes] = await Promise.all([
        dashboardAPI.getStats(),
        contractsAPI.getAll(),
        dashboardAPI.getActivities({ limit: 10 })
      ]);
      setStats(statsRes.data);
      setContracts(contractsRes.data);
      setActivities(activitiesRes.data);

      if (user?.role === 'ceo' || user?.role === 'operations') {
        const teamRes = await dashboardAPI.getTeamPerformance();
        setTeamPerformance(teamRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }} className="animate-fade-in">
      {/* Welcome Card */}
      <div className="card card-gold" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: '#212529' }}>
              {user?.role === 'ceo' ? 'Executive Dashboard' : `Welcome, ${user?.name?.split(' ')[0]}`}
            </h2>
            <p style={{ color: '#6C757D' }}>
              {user?.role === 'ceo' && 'Overview of all contracts, profits, and team performance'}
              {user?.role === 'finance' && 'Create and manage contracts'}
              {user?.role === 'operations' && 'Configure project execution and staff'}
              {user?.role === 'worker' && 'View your assigned tasks'}
            </p>
          </div>
          {user?.role === 'finance' && (
            <Link to="/contracts" className="btn btn-primary">
              <Plus size={18} />
              New Contract
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card stat-card">
          <FileText size={24} color="#B8860B" style={{ marginBottom: '8px' }} />
          <div className="stat-value">{stats?.contracts?.total || 0}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="card stat-card">
          <DollarSign size={24} color="#2E7D32" style={{ marginBottom: '8px' }} />
          <div className="stat-value" style={{ fontSize: '20px', color: '#2E7D32' }}>{formatCurrency(stats?.contracts?.total_value)}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="card stat-card">
          <Target size={24} color="#B8860B" style={{ marginBottom: '8px' }} />
          <div className="stat-value" style={{ fontSize: '20px', color: '#B8860B' }}>{formatCurrency(stats?.contracts?.total_target_profit)}</div>
          <div className="stat-label">Target Profit (30%)</div>
        </div>
        <div className="card stat-card">
          <TrendingUp size={24} color={stats?.contracts?.total_actual_profit >= 0 ? '#2E7D32' : '#C62828'} style={{ marginBottom: '8px' }} />
          <div className="stat-value" style={{ fontSize: '20px', color: stats?.contracts?.total_actual_profit >= 0 ? '#2E7D32' : '#C62828' }}>
            {formatCurrency(stats?.contracts?.total_actual_profit)}
          </div>
          <div className="stat-label">Actual Profit</div>
        </div>
      </div>

      {/* Profit Status Breakdown (from flowchart) */}
      {user?.role === 'ceo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ borderLeft: '4px solid #2E7D32' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2E7D32' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#2E7D32' }}>{stats?.profit_status?.green || 0}</p>
                <p style={{ fontSize: '12px', color: '#6C757D' }}>Actual ≥ Target</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #E65100' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E65100' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#E65100' }}>{stats?.profit_status?.orange || 0}</p>
                <p style={{ fontSize: '12px', color: '#6C757D' }}>Below Target</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #C62828' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#C62828' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#C62828' }}>{stats?.profit_status?.red || 0}</p>
                <p style={{ fontSize: '12px', color: '#6C757D' }}>Loss (Actual &lt; 0)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'ceo' ? '2fr 1fr' : '1fr', gap: '24px' }}>
        {/* Recent Contracts */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Contracts</h3>
            <Link to="/contracts" style={{ color: '#B8860B', fontSize: '14px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {contracts.length === 0 ? (
            <p style={{ color: '#6C757D', textAlign: 'center', padding: '20px' }}>No contracts yet</p>
          ) : (
            <div>
              {contracts.slice(0, 5).map(contract => (
                <div key={contract.id} className="contract-card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <span className="contract-number">{contract.contract_number}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className={`status-badge status-${contract.project_status?.toLowerCase()}`}>{contract.project_status}</span>
                        <span className={`priority-badge profit-${contract.profit_status}`}>
                          {contract.profit_status === 'green' ? '✓ Profitable' : contract.profit_status === 'orange' ? '! Below Target' : '✗ Loss'}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: '700', color: '#212529' }}>{formatCurrency(contract.contract_value)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6C757D' }}>
                    <span>Target: {formatCurrency(contract.target_profit)}</span>
                    <span style={{ color: contract.actual_profit >= 0 ? '#2E7D32' : '#C62828' }}>
                      Actual: {formatCurrency(contract.actual_profit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - CEO Only */}
        {user?.role === 'ceo' && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Team Performance</h3>
            {teamPerformance.length === 0 ? (
              <p style={{ color: '#6C757D', textAlign: 'center', padding: '20px' }}>No team data</p>
            ) : (
              <div>
                {teamPerformance.slice(0, 5).map(member => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #DEE2E6' }}>
                    <img src={member.avatar} alt={member.name} className="avatar avatar-sm" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '13px' }}>{member.name}</p>
                      <div className="progress-bar" style={{ height: '4px', marginTop: '4px' }}>
                        <div className="progress-fill" style={{ width: `${member.completion_rate}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#B8860B' }}>{member.completion_rate}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== CONTRACTS PAGE ====================
const ContractsPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  
  // Finance form (as per flowchart)
  const [financeForm, setFinanceForm] = useState({
    contract_value: '', staff_count: '', tax: '', overhead_cost: '',
    commission: '', admin_fee: '', staff_cost: ''
  });
  
  // Operations form (as per flowchart)
  const [opsForm, setOpsForm] = useState({
    project_start_date: '', project_end_date: '', project_type: 'General',
    duration_type: 'Non-Recurring', manual_status: '', inactive_reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contractsRes, usersRes] = await Promise.all([
        contractsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setContracts(contractsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.create({
        contract_value: parseFloat(financeForm.contract_value) || 0,
        staff_count: parseInt(financeForm.staff_count) || 0,
        tax: parseFloat(financeForm.tax) || 0,
        overhead_cost: parseFloat(financeForm.overhead_cost) || 0,
        commission: parseFloat(financeForm.commission) || 0,
        admin_fee: parseFloat(financeForm.admin_fee) || 0,
        staff_cost: parseFloat(financeForm.staff_cost) || 0
      });
      setShowCreateModal(false);
      setFinanceForm({ contract_value: '', staff_count: '', tax: '', overhead_cost: '', commission: '', admin_fee: '', staff_cost: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create contract');
    }
  };

  const handleOpsSetup = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.updateOperations(selectedContract.id, opsForm);
      setShowOpsModal(false);
      setSelectedContract(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update operations');
    }
  };

  const openOpsModal = (contract) => {
    setSelectedContract(contract);
    setOpsForm({
      project_start_date: contract.project_start_date?.split('T')[0] || '',
      project_end_date: contract.project_end_date?.split('T')[0] || '',
      project_type: contract.project_type || 'General',
      duration_type: contract.duration_type || 'Non-Recurring',
      manual_status: contract.manual_status || '',
      inactive_reason: contract.inactive_reason || ''
    });
    setShowOpsModal(true);
  };

  const canCreateContract = ['ceo', 'finance'].includes(user?.role);
  const canConfigureOps = ['ceo', 'operations'].includes(user?.role);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Contracts</h2>
          <p style={{ color: '#6C757D' }}>{contracts.length} contracts total</p>
        </div>
        {canCreateContract && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" data-testid="create-contract-btn">
            <Plus size={18} />
            New Contract
          </button>
        )}
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} color="#DEE2E6" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No contracts yet</h3>
          <p style={{ color: '#6C757D', marginBottom: '24px' }}>Finance Officer creates contracts</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {contracts.map(contract => (
            <div key={contract.id} className="contract-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="contract-number">{contract.contract_number}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span className={`status-badge status-${contract.project_status?.toLowerCase()}`}>{contract.project_status}</span>
                    <span className={`priority-badge profit-${contract.profit_status}`}>
                      {contract.profit_status === 'green' ? '✓ Profitable' : contract.profit_status === 'orange' ? '! Below Target' : '✗ Loss'}
                    </span>
                    {contract.project_type && <span style={{ fontSize: '12px', color: '#6C757D' }}>{contract.project_type}</span>}
                  </div>
                </div>
                {canConfigureOps && (
                  <button onClick={() => openOpsModal(contract)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                    <Settings size={16} />
                    Configure
                  </button>
                )}
              </div>

              {/* Financial Grid */}
              <div className="financial-grid">
                <div className="financial-item">
                  <div className="financial-label">Contract Value</div>
                  <div className="financial-value">{formatCurrency(contract.contract_value)}</div>
                </div>
                <div className="financial-item">
                  <div className="financial-label">Target Profit (30%)</div>
                  <div className="financial-value" style={{ color: '#B8860B' }}>{formatCurrency(contract.target_profit)}</div>
                </div>
                <div className="financial-item">
                  <div className="financial-label">Actual Profit</div>
                  <div className="financial-value" style={{ color: contract.actual_profit >= 0 ? '#2E7D32' : '#C62828' }}>
                    {formatCurrency(contract.actual_profit)}
                  </div>
                </div>
                <div className="financial-item">
                  <div className="financial-label">Staff Cost</div>
                  <div className="financial-value">{formatCurrency(contract.staff_cost)}</div>
                </div>
                <div className="financial-item">
                  <div className="financial-label">Tax</div>
                  <div className="financial-value">{formatCurrency(contract.tax)}</div>
                </div>
                <div className="financial-item">
                  <div className="financial-label">Overhead</div>
                  <div className="financial-value">{formatCurrency(contract.overhead_cost)}</div>
                </div>
              </div>

              {/* Project Info */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '24px', fontSize: '13px', color: '#6C757D', flexWrap: 'wrap' }}>
                {contract.project_start_date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {format(new Date(contract.project_start_date), 'MMM d, yyyy')} - {contract.project_end_date ? format(new Date(contract.project_end_date), 'MMM d, yyyy') : 'TBD'}
                  </span>
                )}
                {contract.duration_type && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {contract.duration_type}
                  </span>
                )}
                {contract.finance_officer_name && (
                  <span>Finance: {contract.finance_officer_name}</span>
                )}
                {contract.operations_officer_name && (
                  <span>Operations: {contract.operations_officer_name}</span>
                )}
              </div>

              {/* Progress */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#6C757D' }}>Task Progress</span>
                  <span style={{ fontWeight: '600' }}>{contract.task_stats?.progress || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${contract.task_stats?.progress || 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Contract Modal (Finance Officer) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Contract</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateContract}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#6C757D', marginBottom: '20px', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                  <strong>Finance Officer Role:</strong> Enter financial parameters. Contract number will be auto-generated. Profits will be calculated automatically.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Contract Value *</label>
                    <input
                      type="number"
                      value={financeForm.contract_value}
                      onChange={(e) => setFinanceForm({ ...financeForm, contract_value: e.target.value })}
                      className="input"
                      placeholder="0"
                      required
                      data-testid="contract-value-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Staff Count</label>
                    <input
                      type="number"
                      value={financeForm.staff_count}
                      onChange={(e) => setFinanceForm({ ...financeForm, staff_count: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Staff Cost</label>
                    <input
                      type="number"
                      value={financeForm.staff_cost}
                      onChange={(e) => setFinanceForm({ ...financeForm, staff_cost: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Tax</label>
                    <input
                      type="number"
                      value={financeForm.tax}
                      onChange={(e) => setFinanceForm({ ...financeForm, tax: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Overhead Cost</label>
                    <input
                      type="number"
                      value={financeForm.overhead_cost}
                      onChange={(e) => setFinanceForm({ ...financeForm, overhead_cost: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Commission</label>
                    <input
                      type="number"
                      value={financeForm.commission}
                      onChange={(e) => setFinanceForm({ ...financeForm, commission: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Admin Fee</label>
                    <input
                      type="number"
                      value={financeForm.admin_fee}
                      onChange={(e) => setFinanceForm({ ...financeForm, admin_fee: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="submit-contract-btn">Create Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operations Setup Modal */}
      {showOpsModal && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowOpsModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Configure Operations - {selectedContract.contract_number}</h3>
              <button onClick={() => setShowOpsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleOpsSetup}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#6C757D', marginBottom: '20px', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                  <strong>Operations & Quality Officer Role:</strong> Define project timeline and attributes. Status will be auto-set based on dates.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Start Date</label>
                    <input
                      type="date"
                      value={opsForm.project_start_date}
                      onChange={(e) => setOpsForm({ ...opsForm, project_start_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>End Date</label>
                    <input
                      type="date"
                      value={opsForm.project_end_date}
                      onChange={(e) => setOpsForm({ ...opsForm, project_end_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Project Type</label>
                  <select
                    value={opsForm.project_type}
                    onChange={(e) => setOpsForm({ ...opsForm, project_type: e.target.value })}
                    className="input"
                  >
                    <option value="General">General</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Banking">Banking</option>
                    <option value="Pension">Pension</option>
                    <option value="Capital Markets">Capital Markets</option>
                    <option value="Enterprise Risk">Enterprise Risk</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Duration Type</label>
                  <select
                    value={opsForm.duration_type}
                    onChange={(e) => setOpsForm({ ...opsForm, duration_type: e.target.value })}
                    className="input"
                  >
                    <option value="Non-Recurring">Non-Recurring</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Semi-Annually">Semi-Annually</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Manual Status Override</label>
                  <select
                    value={opsForm.manual_status}
                    onChange={(e) => setOpsForm({ ...opsForm, manual_status: e.target.value })}
                    className="input"
                  >
                    <option value="">Auto (based on dates)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {opsForm.manual_status === 'inactive' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Inactive Reason</label>
                    <select
                      value={opsForm.inactive_reason}
                      onChange={(e) => setOpsForm({ ...opsForm, inactive_reason: e.target.value })}
                      className="input"
                    >
                      <option value="">Select reason</option>
                      <option value="Early completion">Early completion</option>
                      <option value="Client delays">Client delays</option>
                      <option value="Operational issues">Operational issues</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowOpsModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-gold">Save Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== TASK BOARD PAGE ====================
const TaskBoardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterContract, setFilterContract] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', contract_id: '', assigned_to: '', priority: 'medium', due_date: ''
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: '#6C757D' },
    { id: 'in_progress', title: 'In Progress', color: '#1565C0' },
    { id: 'review', title: 'Review', color: '#7B1FA2' },
    { id: 'done', title: 'Done', color: '#2E7D32' }
  ];

  useEffect(() => {
    loadData();
  }, [filterContract]);

  const loadData = async () => {
    try {
      const [tasksRes, contractsRes, usersRes] = await Promise.all([
        tasksAPI.getAll({ contract_id: filterContract || undefined }),
        contractsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setTasks(tasksRes.data);
      setContracts(contractsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      });
      setShowModal(false);
      setFormData({ title: '', description: '', contract_id: '', assigned_to: '', priority: 'medium', due_date: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Task Board</h2>
          <p style={{ color: '#6C757D' }}>Track and manage your tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterContract}
            onChange={(e) => setFilterContract(e.target.value)}
            className="input"
            style={{ width: '200px' }}
          >
            <option value="">All Contracts</option>
            {contracts.map(c => (
              <option key={c.id} value={c.id}>{c.contract_number}</option>
            ))}
          </select>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="create-task-btn">
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      <div className="task-board">
        {columns.map(column => (
          <div key={column.id} className="task-column">
            <div className="task-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: column.color }} />
                <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{column.title}</h4>
              </div>
              <span style={{ background: '#E9ECEF', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
                {getTasksByStatus(column.id).length}
              </span>
            </div>
            <div style={{ minHeight: '200px' }}>
              {getTasksByStatus(column.id).map(task => (
                <div key={task.id} className="task-card" onClick={() => setSelectedTask(task)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '14px', flex: 1 }}>{task.title}</h4>
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  </div>
                  {task.contract_number && (
                    <p style={{ fontSize: '11px', color: '#B8860B', marginBottom: '8px' }}>{task.contract_number}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.assigned_user && (
                        <img src={task.assigned_user.avatar} alt={task.assigned_user.name} className="avatar avatar-sm" title={task.assigned_user.name} />
                      )}
                      {task.due_date && (
                        <span style={{ fontSize: '11px', color: isPast(new Date(task.due_date)) && column.id !== 'done' ? '#C62828' : '#6C757D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {task.comment_count > 0 && (
                      <span style={{ fontSize: '11px', color: '#6C757D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} />
                        {task.comment_count}
                      </span>
                    )}
                  </div>
                  {/* Quick status buttons */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {columns.filter(c => c.id !== column.id).map(c => (
                      <button
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task.id, c.id); }}
                        style={{ padding: '4px 8px', fontSize: '10px', background: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        → {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Task</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Enter task title"
                    required
                    data-testid="task-title-input"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Task description"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Contract *</label>
                  <select
                    value={formData.contract_id}
                    onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                    className="input"
                    required
                    data-testid="task-contract-select"
                  >
                    <option value="">Select contract</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.contract_number}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Assign To</label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="input"
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="submit-task-btn">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} users={users} onClose={() => setSelectedTask(null)} onUpdate={loadData} />
      )}
    </div>
  );
};

// ==================== TASK DETAIL MODAL ====================
const TaskDetailModal = ({ task, users, onClose, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    try {
      const res = await tasksAPI.getComments(task.id);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await tasksAPI.addComment(task.id, newComment);
      setNewComment('');
      loadComments();
      onUpdate();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleUpdateTask = async (updates) => {
    try {
      await tasksAPI.update(task.id, updates);
      onUpdate();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(task.id);
        onClose();
        onUpdate();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
            <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{task.title}</h2>
          <p style={{ color: '#B8860B', fontSize: '13px', marginBottom: '16px' }}>{task.contract_number}</p>
          
          {task.description && (
            <p style={{ color: '#6C757D', marginBottom: '20px', lineHeight: '1.6' }}>{task.description}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#6C757D', marginBottom: '6px' }}>Status</label>
              <select
                value={task.status}
                onChange={(e) => handleUpdateTask({ status: e.target.value })}
                className="input"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#6C757D', marginBottom: '6px' }}>Assigned To</label>
              <select
                value={task.assigned_to || ''}
                onChange={(e) => handleUpdateTask({ assigned_to: e.target.value || null })}
                className="input"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid #DEE2E6', paddingTop: '20px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              Comments ({comments.length})
            </h4>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <img src={comment.user?.avatar} alt={comment.user?.name} className="avatar avatar-sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{comment.user?.name}</span>
                      <span style={{ fontSize: '11px', color: '#ADB5BD' }}>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#495057', lineHeight: '1.5' }}>{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p style={{ color: '#ADB5BD', fontSize: '14px' }}>No comments yet</p>
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input"
                placeholder="Add a comment..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== TEAM PAGE (CEO ASSIGNS ROLES) ====================
const TeamPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', phone: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.create({ ...formData, role: 'worker' });
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', department: '', phone: '' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      await usersAPI.assignRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await usersAPI.toggleStatus(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const canManageUsers = ['ceo', 'operations'].includes(user?.role);
  const canAssignRoles = user?.role === 'ceo';

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Team Management</h2>
          <p style={{ color: '#6C757D' }}>{users.length} team members</p>
        </div>
        {canManageUsers && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-member-btn">
            <Plus size={18} />
            Add Worker
          </button>
        )}
      </div>

      {/* Role Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {['ceo', 'finance', 'operations', 'worker'].map(role => (
          <div key={role} className="card stat-card">
            <span className={`role-badge role-${role}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{role}</span>
            <div className="stat-value" style={{ fontSize: '24px' }}>{users.filter(u => u.role === role).length}</div>
          </div>
        ))}
      </div>

      {/* Team Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {users.map(member => (
          <div key={member.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <img src={member.avatar} alt={member.name} className="avatar avatar-lg" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontWeight: '600' }}>{member.name}</h4>
                  {!member.is_active && (
                    <span style={{ fontSize: '10px', background: '#FFEBEE', color: '#C62828', padding: '2px 6px', borderRadius: '4px' }}>Inactive</span>
                  )}
                </div>
                <span className={`role-badge role-${member.role}`}>{member.role}</span>
                <p style={{ fontSize: '13px', color: '#6C757D', marginTop: '8px' }}>{member.email}</p>
              </div>
            </div>

            {/* Task Stats */}
            <div style={{ padding: '12px', background: '#F8F9FA', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6C757D' }}>Task Completion</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#B8860B' }}>{member.stats?.completion_rate || 0}%</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${member.stats?.completion_rate || 0}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#6C757D' }}>
                <span>{member.stats?.completed_tasks || 0} done</span>
                <span>{member.stats?.in_progress || 0} active</span>
                <span>{member.stats?.total_tasks || 0} total</span>
              </div>
            </div>

            {/* Role Assignment (CEO only) */}
            {canAssignRoles && member.role !== 'ceo' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6C757D', marginBottom: '6px' }}>Assign Role</label>
                <select
                  value={member.role}
                  onChange={(e) => handleAssignRole(member.id, e.target.value)}
                  className="input"
                  style={{ fontSize: '13px' }}
                >
                  <option value="worker">Worker</option>
                  <option value="finance">Finance Officer</option>
                  <option value="operations">Operations & Quality Officer</option>
                </select>
              </div>
            )}

            {canAssignRoles && member.id !== user.id && (
              <button
                onClick={() => handleToggleStatus(member.id)}
                className={`btn ${member.is_active ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '100%', fontSize: '13px' }}
              >
                {member.is_active ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Worker Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Add New Worker</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#6C757D', marginBottom: '20px', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
                  New users are added as Workers. The CEO can assign Finance or Operations roles from the team page.
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input"
                      placeholder="e.g., Staff"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="+255..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN LAYOUT ====================
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/contracts': return 'Contracts';
      case '/tasks': return 'Task Board';
      case '/team': return 'Team Management';
      default: return 'ARC';
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle()} />
        {children}
      </main>
    </div>
  );
};

// ==================== APP ====================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout><DashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts"
            element={
              <ProtectedRoute>
                <MainLayout><ContractsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <MainLayout><TaskBoardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <MainLayout><TeamPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
