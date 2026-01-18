import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, FileText, CheckSquare, Users, LogOut, Plus, Menu, X, Calendar, Clock, MessageSquare, TrendingUp, Activity, DollarSign, Eye, Edit2, Trash2, Settings, RefreshCw, Search, Play, Pause, AlertTriangle, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { authAPI, usersAPI, contractsAPI, tasksAPI, dashboardAPI } from './api';
import './App.css';

// Animations
const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

const COLORS = { green: '#22C55E', red: '#EF4444', orange: '#F97316', blue: '#3B82F6', purple: '#8B5CF6', gold: '#B8860B', gray: '#6B7280' };

// Auth Context
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('arc_token');
    const storedUser = localStorage.getItem('arc_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      authAPI.getMe().then(res => { setUser(res.data); localStorage.setItem('arc_user', JSON.stringify(res.data)); }).catch(() => { localStorage.clear(); setUser(null); });
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

  const signup = async (data) => {
    const res = await authAPI.signup(data);
    localStorage.setItem('arc_token', res.data.access_token);
    localStorage.setItem('arc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
    <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
  </div>
);

// Format currency without trailing decimals
const formatCurrency = (amount) => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount?.toLocaleString() || '0';
};

// Stat Card Component - Fixed size
const StatCard = ({ icon: Icon, value, label, color = 'green', delay = 0 }) => (
  <motion.div className="stat-card" initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay, duration: 0.4 }} whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <div className="stat-icon" style={{ background: `${COLORS[color]}15` }}>
      <Icon size={20} color={COLORS[color]} />
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </motion.div>
);

// ==================== LOGIN / SIGNUP PAGE ====================
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup({ email: formData.email, password: formData.password, name: formData.name, phone: formData.phone });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <motion.img src="/images/logo.png" alt="ARC" style={{ height: '50px', marginBottom: '16px' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>{isLogin ? 'Sign in to continue' : 'Sign up to get started'}</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px', marginBottom: '16px', color: '#991B1B', fontSize: '13px' }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="John Doe" required={!isLogin} />
            </div>
          )}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="••••••••" required />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Phone (Optional)</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="+255..." />
            </div>
          )}
          <motion.button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6B7280' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: '#B22222', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <div style={{ marginTop: '20px', padding: '12px', background: '#F9FAFB', borderRadius: '8px', fontSize: '12px' }}>
          <p style={{ fontWeight: '600', color: '#B8860B', marginBottom: '6px' }}>CEO Login:</p>
          <p style={{ color: '#6B7280' }}>ceo@arc.com / admin123</p>
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

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ceo', 'finance', 'operations', 'worker'] },
    { path: '/contracts', icon: FileText, label: 'Contracts', roles: ['ceo', 'finance', 'operations'] },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['ceo', 'finance', 'operations', 'worker'] },
    { path: '/team', icon: Users, label: 'Team', roles: ['ceo', 'operations'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <>
      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ zIndex: 39 }} onClick={onClose} />}
      </AnimatePresence>
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="ARC" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={onClose}>
                <item.icon size={18} /> {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#F9FAFB', borderRadius: '8px', marginBottom: '10px' }}>
            <img src={user?.avatar} alt="" className="avatar" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <span className={`badge role-${user?.role}`} style={{ fontSize: '10px' }}>{user?.role}</span>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="nav-item" style={{ color: '#B22222' }}>
            <LogOut size={18} /> Logout
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
    <motion.header className="header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onMenuClick} className="btn btn-secondary menu-toggle" style={{ padding: '8px', display: 'none' }}><Menu size={18} /></button>
          <h1 style={{ fontSize: '18px', fontWeight: '700' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Welcome, <strong>{user?.name?.split(' ')[0]}</strong></span>
          <span className={`badge role-${user?.role}`}>{user?.role}</span>
        </div>
      </div>
    </motion.header>
  );
};

// ==================== CEO DASHBOARD ====================
const CEODashboard = () => {
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, c, a] = await Promise.all([dashboardAPI.getStats(), contractsAPI.getAll(), dashboardAPI.getActivities({ limit: 8 })]);
      setStats(s.data); setContracts(c.data); setActivities(a.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  const profitData = contracts.slice(0, 5).map(c => ({ name: c.contract_number?.split('-')[2] || 'N/A', Target: c.target_profit, Actual: c.actual_profit }));
  const statusData = [
    { name: 'Active', value: contracts.filter(c => c.project_status === 'Active').length, color: COLORS.green },
    { name: 'Pending', value: contracts.filter(c => c.project_status === 'Pending').length, color: COLORS.orange },
    { name: 'Expired', value: contracts.filter(c => c.project_status === 'Expired').length, color: COLORS.red },
  ].filter(d => d.value > 0);

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={DollarSign} value={formatCurrency(stats?.contracts?.total_value)} label="Total Contract Value" color="green" delay={0} />
        <StatCard icon={TrendingUp} value={formatCurrency(stats?.contracts?.total_actual_profit)} label="Actual Profit" color="blue" delay={0.1} />
        <StatCard icon={CheckCircle} value={stats?.contracts?.active || 0} label="Active Contracts" color="green" delay={0.2} />
        <StatCard icon={Users} value={stats?.team?.total_users || 0} label="Team Members" color="purple" delay={0.3} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <motion.div variants={scaleIn} className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Profit Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Target" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill={COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={scaleIn} className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Contract Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={fadeInUp} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Recent Activity</h3>
          <button onClick={loadData} className="btn btn-secondary btn-sm"><RefreshCw size={14} /></button>
        </div>
        {activities.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No activities yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <Activity size={14} color="#B8860B" />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px' }}><strong>{a.user_name}</strong> {a.action} <span style={{ color: '#B8860B' }}>{a.entity_name}</span></span>
                  <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ==================== FINANCE DASHBOARD ====================
const FinanceDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [financeForm, setFinanceForm] = useState({ staff_count: '', tax: '', overhead_cost: '', commission: '', admin_fee: '', staff_cost: '' });

  const loadData = useCallback(async () => {
    try { const res = await contractsAPI.getAll(); setContracts(res.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.allocateFinance(selectedContract.id, {
        staff_count: parseInt(financeForm.staff_count) || 0,
        tax: parseFloat(financeForm.tax) || 0,
        overhead_cost: parseFloat(financeForm.overhead_cost) || 0,
        commission: parseFloat(financeForm.commission) || 0,
        admin_fee: parseFloat(financeForm.admin_fee) || 0,
        staff_cost: parseFloat(financeForm.staff_cost) || 0
      });
      setSelectedContract(null);
      loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const openAllocate = (contract) => {
    setSelectedContract(contract);
    setFinanceForm({ staff_count: contract.staff_count || '', tax: contract.tax || '', overhead_cost: contract.overhead_cost || '', commission: contract.commission || '', admin_fee: contract.admin_fee || '', staff_cost: contract.staff_cost || '' });
  };

  if (loading) return <LoadingScreen />;

  const pending = contracts.filter(c => !c.finance_allocated);
  const allocated = contracts.filter(c => c.finance_allocated);

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={FileText} value={pending.length} label="Pending Allocation" color="orange" delay={0} />
        <StatCard icon={CheckCircle} value={allocated.length} label="Allocated" color="green" delay={0.1} />
        <StatCard icon={DollarSign} value={formatCurrency(contracts.reduce((s, c) => s + c.contract_value, 0))} label="Total Value" color="gold" delay={0.2} />
      </div>

      <motion.div variants={fadeInUp} className="card">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Contracts Awaiting Finance Allocation</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Contract #</th><th>Client</th><th>Project</th><th>Value</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td style={{ fontWeight: '500', color: '#3B82F6' }}>{c.contract_number}</td>
                  <td>{c.client_name || '-'}</td>
                  <td>{c.project_name || '-'}</td>
                  <td>{formatCurrency(c.contract_value)}</td>
                  <td><span className={`badge ${c.finance_allocated ? 'badge-green' : 'badge-orange'}`}>{c.finance_allocated ? 'Allocated' : 'Pending'}</span></td>
                  <td><button onClick={() => openAllocate(c)} className="btn btn-gold btn-sm"><DollarSign size={12} /> Allocate</button></td>
                </motion.tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#9CA3AF', padding: '30px' }}>No contracts. CEO creates contracts first.</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Allocate Modal */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedContract(null)}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Allocate Finance - {selectedContract.contract_number}</h3>
                <button onClick={() => setSelectedContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleAllocate}>
                <div className="modal-body">
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', padding: '10px', background: '#F9FAFB', borderRadius: '8px' }}>
                    Contract Value: <strong>{formatCurrency(selectedContract.contract_value)}</strong><br />
                    Target Profit (30%): <strong>{formatCurrency(selectedContract.contract_value * 0.3)}</strong>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {['staff_count', 'staff_cost', 'tax', 'overhead_cost', 'commission', 'admin_fee'].map(field => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', textTransform: 'capitalize' }}>{field.replace('_', ' ')}</label>
                        <input type="number" value={financeForm[field]} onChange={e => setFinanceForm({ ...financeForm, [field]: e.target.value })} className="input" placeholder="0" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setSelectedContract(null)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-gold">Save Allocation</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== OPERATIONS DASHBOARD ====================
const OperationsDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [opsForm, setOpsForm] = useState({ project_start_date: '', project_end_date: '', duration_type: 'Non-Recurring', manual_status: '', inactive_reason: '' });

  const loadData = useCallback(async () => {
    try { const res = await contractsAPI.getAll(); setContracts(res.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConfigure = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.updateOperations(selectedContract.id, opsForm);
      setSelectedContract(null);
      loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const openConfigure = (contract) => {
    setSelectedContract(contract);
    setOpsForm({
      project_start_date: contract.project_start_date?.split('T')[0] || '',
      project_end_date: contract.project_end_date?.split('T')[0] || '',
      duration_type: contract.duration_type || 'Non-Recurring',
      manual_status: contract.manual_status || '',
      inactive_reason: contract.inactive_reason || ''
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={Play} value={contracts.filter(c => c.project_status === 'Active').length} label="Active" color="green" delay={0} />
        <StatCard icon={Pause} value={contracts.filter(c => c.project_status === 'Pending').length} label="Pending" color="orange" delay={0.1} />
        <StatCard icon={XCircle} value={contracts.filter(c => c.project_status === 'Expired').length} label="Expired" color="red" delay={0.2} />
      </div>

      <motion.div variants={fadeInUp} className="card">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Configure Project Execution</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Contract #</th><th>Client</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td style={{ fontWeight: '500', color: '#3B82F6' }}>{c.contract_number}</td>
                  <td>{c.client_name || '-'}</td>
                  <td>{c.project_type || '-'}</td>
                  <td>{c.project_start_date ? format(new Date(c.project_start_date), 'MMM d, yyyy') : '-'}</td>
                  <td>{c.project_end_date ? format(new Date(c.project_end_date), 'MMM d, yyyy') : '-'}</td>
                  <td><span className={`badge status-${c.project_status?.toLowerCase()}`}>{c.project_status}</span></td>
                  <td><button onClick={() => openConfigure(c)} className="btn btn-secondary btn-sm"><Settings size={12} /> Configure</button></td>
                </motion.tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#9CA3AF', padding: '30px' }}>No contracts yet</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Configure Modal */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedContract(null)}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Configure - {selectedContract.contract_number}</h3>
                <button onClick={() => setSelectedContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleConfigure}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Start Date</label>
                      <input type="date" value={opsForm.project_start_date} onChange={e => setOpsForm({ ...opsForm, project_start_date: e.target.value })} className="input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>End Date</label>
                      <input type="date" value={opsForm.project_end_date} onChange={e => setOpsForm({ ...opsForm, project_end_date: e.target.value })} className="input" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Duration Type</label>
                    <select value={opsForm.duration_type} onChange={e => setOpsForm({ ...opsForm, duration_type: e.target.value })} className="input">
                      {['Non-Recurring', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Manual Status Override</label>
                    <select value={opsForm.manual_status} onChange={e => setOpsForm({ ...opsForm, manual_status: e.target.value })} className="input">
                      <option value="">Auto (based on dates)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  {opsForm.manual_status === 'inactive' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Inactive Reason</label>
                      <select value={opsForm.inactive_reason} onChange={e => setOpsForm({ ...opsForm, inactive_reason: e.target.value })} className="input">
                        <option value="">Select reason</option>
                        <option value="Early completion">Early completion</option>
                        <option value="Client delays">Client delays</option>
                        <option value="Operational issues">Operational issues</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setSelectedContract(null)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
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
    try { const res = await tasksAPI.getAll({ assigned_to: user?.id }); setTasks(res.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');
  const overdue = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'done');

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeInUp} className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Welcome, {user?.name}!</h2>
        <p style={{ color: '#92400E', fontSize: '13px' }}>Here are your assigned tasks and projects</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={FileText} value={todo.length} label="To Do" color="gray" delay={0} />
        <StatCard icon={Activity} value={inProgress.length} label="In Progress" color="blue" delay={0.1} />
        <StatCard icon={CheckCircle} value={done.length} label="Completed" color="green" delay={0.2} />
        <StatCard icon={AlertTriangle} value={overdue.length} label="Overdue" color="red" delay={0.3} />
      </div>

      <motion.div variants={fadeInUp} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600' }}>My Tasks</h3>
          <Link to="/tasks" className="btn btn-primary btn-sm"><CheckSquare size={14} /> View All</Link>
        </div>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
            <CheckSquare size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.slice(0, 5).map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{task.title}</h4>
                    <p style={{ fontSize: '12px', color: '#B8860B' }}>{task.project_name || task.contract_number}</p>
                  </div>
                  <span className={`badge badge-${task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'orange' : 'blue'}`}>{task.priority}</span>
                </div>
                {task.due_date && (
                  <p style={{ fontSize: '11px', color: isPast(new Date(task.due_date)) && task.status !== 'done' ? '#EF4444' : '#6B7280', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </p>
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
  if (user?.role === 'ceo') return <CEODashboard />;
  if (user?.role === 'finance') return <FinanceDashboard />;
  if (user?.role === 'operations') return <OperationsDashboard />;
  return <WorkerDashboard />;
};

// ==================== CONTRACTS PAGE (CEO Only) ====================
const ContractsPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ client_name: '', project_name: '', project_type: 'General', contract_value: '', description: '' });

  const loadData = useCallback(async () => {
    try { const res = await contractsAPI.getAll(); setContracts(res.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await contractsAPI.create({ ...formData, contract_value: parseFloat(formData.contract_value) || 0 });
      setShowModal(false);
      setFormData({ client_name: '', project_name: '', project_type: 'General', contract_value: '', description: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to create'); }
  };

  if (loading) return <LoadingScreen />;

  const isCEO = user?.role === 'ceo';

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Contracts</h2>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>{contracts.length} total</p>
        </div>
        {isCEO && <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> New Contract</button>}
      </div>

      <motion.div variants={fadeInUp} className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Contract #</th><th>Client</th><th>Project</th><th>Value</th><th>Target Profit</th><th>Actual Profit</th><th>Status</th></tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td style={{ fontWeight: '500', color: '#3B82F6' }}>{c.contract_number}</td>
                  <td>{c.client_name || '-'}</td>
                  <td>{c.project_name || '-'}</td>
                  <td>{formatCurrency(c.contract_value)}</td>
                  <td>{formatCurrency(c.target_profit)}</td>
                  <td style={{ color: c.actual_profit >= 0 ? '#22C55E' : '#EF4444' }}>{formatCurrency(c.actual_profit)}</td>
                  <td><span className={`badge ${c.profit_status === 'green' ? 'badge-green' : c.profit_status === 'orange' ? 'badge-orange' : 'badge-red'}`}>{c.profit_status === 'green' ? 'Profitable' : c.profit_status === 'orange' ? 'Below Target' : 'Loss'}</span></td>
                </motion.tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#9CA3AF', padding: '30px' }}>No contracts yet</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Contract Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Create New Contract</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Client Name *</label>
                    <input type="text" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} className="input" required />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Project Name *</label>
                    <input type="text" value={formData.project_name} onChange={e => setFormData({ ...formData, project_name: e.target.value })} className="input" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Project Type</label>
                      <select value={formData.project_type} onChange={e => setFormData({ ...formData, project_type: e.target.value })} className="input">
                        {['General', 'Insurance', 'Banking', 'Pension', 'Capital Markets', 'Enterprise Risk'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contract Value *</label>
                      <input type="number" value={formData.contract_value} onChange={e => setFormData({ ...formData, contract_value: e.target.value })} className="input" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input" rows={3} style={{ resize: 'vertical' }} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== TASKS PAGE ====================
const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', contract_id: '', assigned_to: '', priority: 'medium', due_date: '' });

  const columns = [{ id: 'todo', title: 'To Do', color: '#6B7280' }, { id: 'in_progress', title: 'In Progress', color: '#3B82F6' }, { id: 'review', title: 'Review', color: '#8B5CF6' }, { id: 'done', title: 'Done', color: '#22C55E' }];

  const loadData = useCallback(async () => {
    try {
      const [t, c, u] = await Promise.all([tasksAPI.getAll(), contractsAPI.getAll(), usersAPI.getAll()]);
      setTasks(t.data); setContracts(c.data); setUsers(u.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...formData, due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null });
      setShowModal(false);
      setFormData({ title: '', description: '', contract_id: '', assigned_to: '', priority: 'medium', due_date: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const updateStatus = async (taskId, status) => {
    try { await tasksAPI.update(taskId, { status }); loadData(); } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Task Board</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> New Task</button>
      </div>

      <div className="task-board">
        {columns.map((col, ci) => (
          <motion.div key={col.id} className="task-column" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <div className="task-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{col.title}</span>
              </div>
              <span style={{ background: '#E5E7EB', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{tasks.filter(t => t.status === col.id).length}</span>
            </div>
            <AnimatePresence>
              {tasks.filter(t => t.status === col.id).map((task, i) => (
                <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} className="task-card" whileHover={{ y: -2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '13px', flex: 1 }}>{task.title}</h4>
                    <span className={`badge badge-${task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'orange' : 'blue'}`} style={{ fontSize: '9px' }}>{task.priority}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#B8860B', marginBottom: '8px' }}>{task.project_name || task.contract_number}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    {task.assigned_user && <img src={task.assigned_user.avatar} alt="" className="avatar avatar-sm" />}
                    {task.due_date && <span style={{ fontSize: '10px', color: isPast(new Date(task.due_date)) && col.id !== 'done' ? '#EF4444' : '#6B7280' }}><Calendar size={10} /> {format(new Date(task.due_date), 'MMM d')}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {columns.filter(c => c.id !== col.id).map(c => (
                      <button key={c.id} onClick={() => updateStatus(task.id, c.id)} style={{ padding: '3px 6px', fontSize: '9px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer' }}>→ {c.title}</button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Create Task</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Title *</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contract *</label>
                    <select value={formData.contract_id} onChange={e => setFormData({ ...formData, contract_id: e.target.value })} className="input" required>
                      <option value="">Select contract</option>
                      {contracts.map(c => <option key={c.id} value={c.id}>{c.contract_number} - {c.client_name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Assign To</label>
                      <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="input">
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="input">
                        {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Due Date</label>
                    <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
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

  const loadData = useCallback(async () => {
    try { const res = await usersAPI.getAll(); setUsers(res.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const assignRole = async (userId, role) => {
    try { await usersAPI.assignRole(userId, role); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  if (loading) return <LoadingScreen />;

  const isCEO = user?.role === 'ceo';

  return (
    <motion.div style={{ padding: '20px' }} initial="hidden" animate="visible" variants={stagger}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Team Management</h2>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>{users.length} members</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={Users} value={users.filter(u => u.role === 'ceo').length} label="CEO" color="red" delay={0} />
        <StatCard icon={DollarSign} value={users.filter(u => u.role === 'finance').length} label="Finance" color="gold" delay={0.1} />
        <StatCard icon={Settings} value={users.filter(u => u.role === 'operations').length} label="Operations" color="green" delay={0.2} />
        <StatCard icon={UserPlus} value={users.filter(u => u.role === 'worker').length} label="Workers" color="blue" delay={0.3} />
      </div>

      <motion.div variants={fadeInUp} className="card">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Team Members {isCEO && <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '400' }}>(CEO can assign roles)</span>}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {users.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px' }} whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src={member.avatar} alt="" className="avatar avatar-lg" />
                <div>
                  <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{member.name}</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>{member.email}</p>
                  <span className={`badge role-${member.role}`}>{member.role}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
                <span>Tasks: {member.stats?.total_tasks || 0}</span>
                <span>Done: {member.stats?.completed_tasks || 0}</span>
                <span style={{ color: '#B8860B', fontWeight: '600' }}>{member.stats?.completion_rate || 0}%</span>
              </div>
              {isCEO && member.role !== 'ceo' && (
                <select value={member.role} onChange={e => assignRole(member.id, e.target.value)} className="input" style={{ fontSize: '12px', padding: '6px 10px' }}>
                  <option value="worker">Worker</option>
                  <option value="finance">Finance Officer</option>
                  <option value="operations">Operations Officer</option>
                </select>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN LAYOUT ====================
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const titles = { '/dashboard': 'Dashboard', '/contracts': 'Contracts', '/tasks': 'Task Board', '/team': 'Team' };
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} title={titles[location.pathname] || 'ARC'} />
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
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><MainLayout><ContractsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><MainLayout><TasksPage /></MainLayout></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><MainLayout><TeamPage /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
