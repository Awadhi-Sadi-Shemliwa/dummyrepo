import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, FileText, CheckSquare, Users, LogOut,
  Plus, Menu, X, Calendar, Clock, MessageSquare, TrendingUp, Activity,
  DollarSign, Eye, Printer, Edit2, Trash2, Settings, RefreshCw, Search,
  ChevronRight, Play, Pause, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { authAPI, usersAPI, contractsAPI, tasksAPI, dashboardAPI } from './api';
import './App.css';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

// Chart colors
const COLORS = {
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F97316',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  gold: '#B8860B',
  gray: '#6B7280',
  teal: '#14B8A6'
};

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
    <motion.div 
      className="spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// ==================== FORMAT CURRENCY ====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
};

// ==================== ANIMATED STAT CARD ====================
const StatCard = ({ icon: Icon, value, label, color = 'green', delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    className="card stat-card"
    style={{ borderLeft: `4px solid ${COLORS[color]}` }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
        style={{ 
          width: '48px', height: '48px', borderRadius: '12px', 
          background: `${COLORS[color]}15`, display: 'flex', 
          alignItems: 'center', justifyContent: 'center' 
        }}
      >
        <Icon size={24} color={COLORS[color]} />
      </motion.div>
      <div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          style={{ fontSize: '28px', fontWeight: '700', color: '#212529' }}
        >
          {value}
        </motion.p>
        <p style={{ fontSize: '13px', color: '#6C757D' }}>{label}</p>
      </div>
    </div>
  </motion.div>
);

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
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card" 
        style={{ maxWidth: '420px', width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.img 
            src="/images/logo.png" 
            alt="ARC Logo" 
            style={{ height: '60px', marginBottom: '16px' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#212529' }}>Project Management System</h1>
          <p style={{ color: '#6C757D', fontSize: '14px' }}>Sign in to manage contracts and tasks</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#C62828', fontSize: '14px' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#495057', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="Enter your email" required data-testid="login-email" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#495057', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Enter your password" required data-testid="login-password" />
          </div>
          <motion.button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#F8F9FA', borderRadius: '8px', fontSize: '13px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', color: '#B8860B' }}>Test Credentials:</p>
          <p style={{ color: '#6C757D' }}><strong>CEO:</strong> sadi@arc.com / 12345678</p>
          <p style={{ color: '#6C757D' }}><strong>Finance:</strong> maureen.bangu@ar-consurt-world.com / 12345678</p>
          <p style={{ color: '#6C757D' }}><strong>Operations:</strong> juma.h.kasele@gmail.com / 11223344</p>
        </div>
      </motion.div>
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            style={{ zIndex: 39 }} 
            onClick={onClose} 
          />
        )}
      </AnimatePresence>
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="ARC" style={{ height: '40px' }} />
        </div>

        <nav className="sidebar-nav">
          {getNavItems().map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
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
const Header = ({ onMenuClick, title, subtitle }) => {
  const { user } = useAuth();
  const [lang, setLang] = useState('English');
  
  return (
    <motion.header 
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onMenuClick} className="btn btn-secondary menu-toggle" style={{ padding: '8px' }}>
            <Menu size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6C757D', marginBottom: '4px' }}>
              <span>Home</span> <ChevronRight size={14} /> <span>{title}</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#212529' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: '13px', color: '#6C757D' }}>{subtitle}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="input" style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: '13px' }}>
            <option value="English">English</option>
            <option value="Kiswahili">Kiswahili</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6C757D' }}>Welcome,</span>
            <span style={{ fontWeight: '600', color: '#212529' }}>{user?.name}</span>
            <span className={`role-badge role-${user?.role}`}>({user?.role})</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// ==================== CEO DASHBOARD ====================
const CEODashboard = () => {
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [statsRes, contractsRes] = await Promise.all([
        dashboardAPI.getStats(),
        contractsAPI.getAll()
      ]);
      setStats(statsRes.data);
      setContracts(contractsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  // Chart data
  const profitComparisonData = contracts.slice(0, 5).map(c => ({
    name: c.contract_number,
    'Target Profit': c.target_profit,
    'Actual Profit': c.actual_profit
  }));

  const statusDistribution = [
    { name: 'Active', value: contracts.filter(c => c.project_status === 'Active').length, color: COLORS.green },
    { name: 'Expired', value: contracts.filter(c => c.project_status === 'Expired').length, color: COLORS.red },
    { name: 'Inactive', value: contracts.filter(c => c.project_status === 'Inactive').length, color: COLORS.orange },
    { name: 'Pending', value: contracts.filter(c => c.project_status === 'Pending').length, color: COLORS.gray }
  ].filter(d => d.value > 0);

  const staffAllocationData = contracts.slice(0, 5).map(c => ({
    name: c.contract_number,
    staff: c.staff_count || 0
  }));

  const filteredContracts = filter === 'all' ? contracts : contracts.filter(c => c.project_status?.toLowerCase() === filter);

  const avgProfitMargin = contracts.length > 0 
    ? ((contracts.reduce((sum, c) => sum + (c.actual_profit / c.contract_value * 100 || 0), 0)) / contracts.length).toFixed(2)
    : 0;

  return (
    <motion.div 
      style={{ padding: '24px' }}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={DollarSign} value={formatCurrency(stats?.contracts?.total_value)} label="Total Contract Value" color="green" delay={0} />
        <StatCard icon={TrendingUp} value={formatCurrency(stats?.contracts?.total_actual_profit)} label="Total Actual Profit" color="blue" delay={0.1} />
        <StatCard icon={CheckCircle} value={stats?.contracts?.active || 0} label="Active Contracts" color="green" delay={0.2} />
        <StatCard icon={Users} value={stats?.team?.total_users || 0} label="Total Staff Allocated" color="purple" delay={0.3} />
        <StatCard icon={Activity} value={`${avgProfitMargin}%`} label="Average Profit Margin" color="gold" delay={0.4} />
      </div>

      {/* Filter Tabs */}
      <motion.div variants={fadeInUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {[{ id: 'all', label: 'All Contracts', icon: FileText }, { id: 'active', label: 'Active', icon: Play }, { id: 'expired', label: 'Expired', icon: XCircle }, { id: 'inactive', label: 'Inactive', icon: Pause }].map(f => (
          <motion.button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <f.icon size={16} />
            {f.label}
          </motion.button>
        ))}
        <button onClick={loadData} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Profit Comparison Chart */}
        <motion.div variants={scaleIn} className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Profit Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Target Profit" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual Profit" fill={COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Contract Status Distribution */}
        <motion.div variants={scaleIn} className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Contract Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Staff Allocation */}
        <motion.div variants={scaleIn} className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Staff Allocation Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={staffAllocationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="staff" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Operations Project Overview Table */}
      <motion.div variants={fadeInUp} className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Operations Project Overview</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Contract #</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Client Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Project Type</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Profit Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <motion.tr 
                  key={contract.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderBottom: '1px solid #DEE2E6' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.blue, fontWeight: '500' }}>{contract.contract_number}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.client_name || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_type || 'General'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_start_date ? format(new Date(contract.project_start_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_end_date ? format(new Date(contract.project_end_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-badge status-${contract.project_status?.toLowerCase()}`}>{contract.project_status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`priority-badge profit-${contract.profit_status}`}>
                      {contract.profit_status === 'green' ? '✓ Profitable' : contract.profit_status === 'orange' ? 'Below Target' : 'Loss'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredContracts.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#6C757D' }}>No contracts found</p>
          )}
        </div>
        <p style={{ fontSize: '13px', color: '#6C757D', marginTop: '16px' }}>Showing {filteredContracts.length} of {contracts.length} records</p>
      </motion.div>
    </motion.div>
  );
};

// ==================== OPERATIONS DASHBOARD ====================
const OperationsDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await contractsAPI.getAll();
      setContracts(res.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  const activeCount = contracts.filter(c => c.project_status === 'Active').length;
  const completedCount = contracts.filter(c => c.project_status === 'Expired').length;
  const delayedCount = 0; // Add logic for delayed
  const inactiveCount = contracts.filter(c => c.project_status === 'Inactive').length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0);

  const filteredContracts = contracts
    .filter(c => filter === 'all' || c.project_status?.toLowerCase() === filter)
    .filter(c => !search || c.contract_number?.toLowerCase().includes(search.toLowerCase()) || c.client_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div style={{ padding: '24px' }} initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={Play} value={activeCount} label="Active Operations" color="green" delay={0} />
        <StatCard icon={CheckCircle} value={completedCount} label="Completed" color="green" delay={0.1} />
        <StatCard icon={AlertTriangle} value={delayedCount} label="Delayed" color="red" delay={0.2} />
        <StatCard icon={Pause} value={inactiveCount} label="Inactive" color="gray" delay={0.3} />
        <StatCard icon={DollarSign} value={`$ ${formatCurrency(totalValue)}`} label="Total Contract Value" color="green" delay={0.4} />
      </div>

      {/* Filters */}
      <motion.div variants={fadeInUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        {[{ id: 'all', label: 'All Operations', icon: FileText }, { id: 'active', label: 'Active', icon: Play }, { id: 'expired', label: 'Completed', icon: CheckCircle }, { id: 'inactive', label: 'Inactive', icon: Pause }].map(f => (
          <motion.button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <f.icon size={16} /> {f.label}
          </motion.button>
        ))}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6C757D' }} />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="input" 
              placeholder="Search by contract number, client name..." 
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <Link to="/contracts" className="btn btn-primary">
            <Plus size={18} /> New Operations
          </Link>
        </div>
      </motion.div>

      {/* Operations Table */}
      <motion.div variants={fadeInUp} className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#374151', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Invoice ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Contract #</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Client Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Project Type</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <motion.tr 
                  key={contract.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  style={{ borderBottom: '1px solid #DEE2E6', background: index % 2 === 0 ? 'white' : '#F8F9FA' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.blue }}>OPS-{String(index + 1).padStart(5, '0')}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.contract_number}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.client_name || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_type || 'General'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_start_date ? format(new Date(contract.project_start_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_end_date ? format(new Date(contract.project_end_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-badge status-${contract.project_status?.toLowerCase()}`}>{contract.project_status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#8B5CF6', color: 'white' }}><Eye size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#F59E0B', color: 'white' }}><Edit2 size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#EF4444', color: 'white' }}><Trash2 size={14} /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '13px', color: '#6C757D', marginTop: '16px' }}>Showing {filteredContracts.length} of {contracts.length} records</p>
      </motion.div>
    </motion.div>
  );
};

// ==================== FINANCE DASHBOARD ====================
const FinanceDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    contract_value: '', staff_count: '', tax: '', overhead_cost: '', commission: '', admin_fee: '', staff_cost: '', client_name: ''
  });

  const loadData = useCallback(async () => {
    try {
      const res = await contractsAPI.getAll();
      setContracts(res.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.create({
        contract_value: parseFloat(formData.contract_value) || 0,
        staff_count: parseInt(formData.staff_count) || 0,
        tax: parseFloat(formData.tax) || 0,
        overhead_cost: parseFloat(formData.overhead_cost) || 0,
        commission: parseFloat(formData.commission) || 0,
        admin_fee: parseFloat(formData.admin_fee) || 0,
        staff_cost: parseFloat(formData.staff_cost) || 0
      });
      setShowModal(false);
      setFormData({ contract_value: '', staff_count: '', tax: '', overhead_cost: '', commission: '', admin_fee: '', staff_cost: '', client_name: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create contract');
    }
  };

  if (loading) return <LoadingScreen />;

  const activeCount = contracts.filter(c => c.project_status === 'Active').length;
  const expiredCount = contracts.filter(c => c.project_status === 'Expired').length;
  const totalProfit = contracts.reduce((sum, c) => sum + (c.actual_profit || 0), 0);
  const totalValue = contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const totalStaff = contracts.reduce((sum, c) => sum + (c.staff_count || 0), 0);

  const filteredContracts = filter === 'all' ? contracts : contracts.filter(c => c.project_status?.toLowerCase() === filter);

  return (
    <motion.div style={{ padding: '24px' }} initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={CheckCircle} value={activeCount} label="Active Projects" color="green" delay={0} />
        <StatCard icon={XCircle} value={expiredCount} label="Expired Projects" color="red" delay={0.1} />
        <StatCard icon={TrendingUp} value={formatCurrency(totalProfit)} label="Total Profit" color="green" delay={0.2} />
        <StatCard icon={DollarSign} value={formatCurrency(totalValue)} label="Contract Value" color="gold" delay={0.3} />
        <StatCard icon={Users} value={totalStaff} label="Staff Allocated" color="purple" delay={0.4} />
      </div>

      {/* Filters */}
      <motion.div variants={fadeInUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        {[{ id: 'all', label: 'All Contracts', icon: FileText }, { id: 'active', label: 'Active', icon: CheckCircle }, { id: 'expired', label: 'Expired', icon: XCircle }, { id: 'inactive', label: 'Inactive', icon: Pause }].map(f => (
          <motion.button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <f.icon size={16} /> {f.label}
          </motion.button>
        ))}
        <motion.button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginLeft: 'auto' }} whileHover={{ scale: 1.02 }} data-testid="create-contract-btn">
          <Plus size={18} /> New Contract
        </motion.button>
      </motion.div>

      {/* Contract Table */}
      <motion.div variants={fadeInUp} className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Contract Number</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Client Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Effective Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Contract Value</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Actual Profit</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6C757D', borderBottom: '2px solid #DEE2E6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => (
                <motion.tr 
                  key={contract.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  style={{ borderBottom: '1px solid #DEE2E6' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{contract.contract_number}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.client_name || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_start_date ? format(new Date(contract.project_start_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{contract.project_end_date ? format(new Date(contract.project_end_date), 'yyyy-MM-dd') : '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(contract.contract_value)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '500', color: contract.actual_profit >= 0 ? COLORS.green : COLORS.red }}>{formatCurrency(contract.actual_profit)}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-badge status-${contract.project_status?.toLowerCase()}`}>{contract.project_status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#8B5CF6', color: 'white' }}><Eye size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#8B5CF6', color: 'white' }}><Printer size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#F59E0B', color: 'white' }}><Edit2 size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="btn" style={{ padding: '6px', background: '#EF4444', color: 'white' }}><Trash2 size={14} /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '13px', color: '#6C757D', marginTop: '16px' }}>Showing {filteredContracts.length} of {contracts.length} records</p>
      </motion.div>

      {/* Create Contract Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal" 
              style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Contract</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateContract}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Contract Value *</label>
                      <input type="number" value={formData.contract_value} onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })} className="input" placeholder="0" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Staff Count</label>
                      <input type="number" value={formData.staff_count} onChange={(e) => setFormData({ ...formData, staff_count: e.target.value })} className="input" placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Staff Cost</label>
                      <input type="number" value={formData.staff_cost} onChange={(e) => setFormData({ ...formData, staff_cost: e.target.value })} className="input" placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Tax</label>
                      <input type="number" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: e.target.value })} className="input" placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Overhead Cost</label>
                      <input type="number" value={formData.overhead_cost} onChange={(e) => setFormData({ ...formData, overhead_cost: e.target.value })} className="input" placeholder="0" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Commission</label>
                      <input type="number" value={formData.commission} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} className="input" placeholder="0" />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Admin Fee</label>
                      <input type="number" value={formData.admin_fee} onChange={(e) => setFormData({ ...formData, admin_fee: e.target.value })} className="input" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Contract</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== WORKER DASHBOARD ====================
const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await tasksAPI.getAll({ assigned_to: user?.id });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const overdueTasks = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'done');

  return (
    <motion.div style={{ padding: '24px' }} initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="card card-gold" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Welcome, {user?.name}!</h2>
        <p style={{ color: '#6C757D' }}>Here are your assigned tasks and projects</p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={FileText} value={todoTasks.length} label="To Do" color="gray" delay={0} />
        <StatCard icon={Activity} value={inProgressTasks.length} label="In Progress" color="blue" delay={0.1} />
        <StatCard icon={CheckCircle} value={completedTasks.length} label="Completed" color="green" delay={0.2} />
        <StatCard icon={AlertTriangle} value={overdueTasks.length} label="Overdue" color="red" delay={0.3} />
      </div>

      {/* My Tasks */}
      <motion.div variants={fadeInUp} className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>My Tasks</h3>
          <Link to="/tasks" className="btn btn-primary" style={{ fontSize: '13px' }}>
            <CheckSquare size={16} /> View All Tasks
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckSquare size={48} color="#DEE2E6" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#6C757D' }}>No tasks assigned yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {tasks.slice(0, 5).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="task-card"
                style={{ margin: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{task.title}</h4>
                    <p style={{ fontSize: '12px', color: '#B8860B' }}>{task.contract_number}</p>
                  </div>
                  <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                </div>
                {task.due_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: isPast(new Date(task.due_date)) && task.status !== 'done' ? COLORS.red : '#6C757D' }}>
                    <Calendar size={14} />
                    Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    {isPast(new Date(task.due_date)) && task.status !== 'done' && <span style={{ color: COLORS.red, fontWeight: '600' }}> (OVERDUE)</span>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ==================== DASHBOARD ROUTER ====================
const DashboardPage = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'ceo':
      return <CEODashboard />;
    case 'operations':
      return <OperationsDashboard />;
    case 'finance':
      return <FinanceDashboard />;
    default:
      return <WorkerDashboard />;
  }
};

// ==================== CONTRACTS PAGE ====================
const ContractsPage = () => {
  const { user } = useAuth();
  
  if (user?.role === 'finance') {
    return <FinanceDashboard />;
  }
  if (user?.role === 'operations') {
    return <OperationsDashboard />;
  }
  return <CEODashboard />;
};

// ==================== TASK BOARD PAGE ====================
const TaskBoardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterContract, setFilterContract] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', contract_id: '', assigned_to: '', priority: 'medium', due_date: '' });

  const columns = [
    { id: 'todo', title: 'To Do', color: '#6C757D' },
    { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
    { id: 'review', title: 'Review', color: '#8B5CF6' },
    { id: 'done', title: 'Done', color: '#22C55E' }
  ];

  const loadData = useCallback(async () => {
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
  }, [filterContract]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...formData, due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null });
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
    <motion.div style={{ padding: '24px' }} initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Task Board</h2>
          <p style={{ color: '#6C757D' }}>Track and manage your tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)} className="input" style={{ width: '200px' }}>
            <option value="">All Contracts</option>
            {contracts.map(c => <option key={c.id} value={c.id}>{c.contract_number}</option>)}
          </select>
          <motion.button onClick={() => setShowModal(true)} className="btn btn-primary" whileHover={{ scale: 1.02 }}>
            <Plus size={18} /> New Task
          </motion.button>
        </div>
      </motion.div>

      <div className="task-board">
        {columns.map((column, colIndex) => (
          <motion.div 
            key={column.id} 
            className="task-column"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.1 }}
          >
            <div className="task-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: column.color }} />
                <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{column.title}</h4>
              </div>
              <span style={{ background: '#E9ECEF', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>{getTasksByStatus(column.id).length}</span>
            </div>
            <div style={{ minHeight: '200px' }}>
              <AnimatePresence>
                {getTasksByStatus(column.id).map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="task-card"
                    whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ fontWeight: '600', fontSize: '14px', flex: 1 }}>{task.title}</h4>
                      <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.contract_number && <p style={{ fontSize: '11px', color: '#B8860B', marginBottom: '8px' }}>{task.contract_number}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {task.assigned_user && <img src={task.assigned_user.avatar} alt={task.assigned_user.name} className="avatar avatar-sm" title={task.assigned_user.name} />}
                        {task.due_date && (
                          <span style={{ fontSize: '11px', color: isPast(new Date(task.due_date)) && column.id !== 'done' ? COLORS.red : '#6C757D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {columns.filter(c => c.id !== column.id).map(c => (
                        <motion.button
                          key={c.id}
                          onClick={() => handleUpdateStatus(task.id, c.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ padding: '4px 8px', fontSize: '10px', background: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          → {c.title}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Task</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Task Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input" placeholder="Enter task title" required />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Contract *</label>
                    <select value={formData.contract_id} onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })} className="input" required>
                      <option value="">Select contract</option>
                      {contracts.map(c => <option key={c.id} value={c.id}>{c.contract_number}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Assign To</label>
                      <select value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} className="input">
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Priority</label>
                      <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Due Date</label>
                    <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== TEAM PAGE ====================
const TeamPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', phone: '' });

  const loadUsers = useCallback(async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

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

  if (loading) return <LoadingScreen />;

  return (
    <motion.div style={{ padding: '24px' }} initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Team Management</h2>
          <p style={{ color: '#6C757D' }}>{users.length} team members</p>
        </div>
        <motion.button onClick={() => setShowModal(true)} className="btn btn-primary" whileHover={{ scale: 1.02 }}>
          <Plus size={18} /> Add Worker
        </motion.button>
      </motion.div>

      {/* Role Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {['ceo', 'finance', 'operations', 'worker'].map((role, index) => (
          <StatCard key={role} icon={Users} value={users.filter(u => u.role === role).length} label={role.toUpperCase()} color={role === 'ceo' ? 'red' : role === 'finance' ? 'gold' : role === 'operations' ? 'green' : 'blue'} delay={index * 0.1} />
        ))}
      </div>

      {/* Team Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {users.map((member, index) => (
          <motion.div 
            key={member.id} 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <img src={member.avatar} alt={member.name} className="avatar avatar-lg" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{member.name}</h4>
                <span className={`role-badge role-${member.role}`}>{member.role}</span>
                <p style={{ fontSize: '13px', color: '#6C757D', marginTop: '8px' }}>{member.email}</p>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#F8F9FA', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6C757D' }}>Task Completion</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#B8860B' }}>{member.stats?.completion_rate || 0}%</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <motion.div 
                  className="progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${member.stats?.completion_rate || 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {user?.role === 'ceo' && member.role !== 'ceo' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6C757D', marginBottom: '6px' }}>Assign Role</label>
                <select value={member.role} onChange={(e) => handleAssignRole(member.id, e.target.value)} className="input" style={{ fontSize: '13px' }}>
                  <option value="worker">Worker</option>
                  <option value="finance">Finance Officer</option>
                  <option value="operations">Operations Officer</option>
                </select>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Add New Worker</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Enter full name" required />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="Enter email" required />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Password *</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="Enter password" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Worker</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN LAYOUT ====================
const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    const titles = {
      '/dashboard': { title: user?.role === 'ceo' ? 'Overview Dashboard' : user?.role === 'operations' ? 'Operations & Quality Management' : user?.role === 'finance' ? 'Project Management' : 'My Dashboard', subtitle: user?.role === 'ceo' ? 'Executive overview of all contracts and profits' : user?.role === 'operations' ? 'Manage operations and project execution' : user?.role === 'finance' ? 'Manage contracts and project finances' : 'View your assigned tasks and projects' },
      '/contracts': { title: user?.role === 'finance' ? 'Project Management' : 'Operations & Quality', subtitle: 'Manage contracts and operations' },
      '/tasks': { title: 'Task Board', subtitle: 'Track and manage your tasks' },
      '/team': { title: 'Team Management', subtitle: 'Manage team members and roles' }
    };
    return titles[location.pathname] || { title: 'ARC', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} subtitle={subtitle} />
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
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><MainLayout><ContractsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><MainLayout><TaskBoardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><MainLayout><TeamPage /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
