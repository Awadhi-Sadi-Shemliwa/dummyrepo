import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut,
  Plus, Search, Bell, Menu, X, ChevronDown, Calendar, Clock, MessageSquare,
  TrendingUp, AlertTriangle, Target, BarChart3, Activity, User, Filter,
  Edit2, Trash2, ArrowRight, Building2, DollarSign
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { authAPI, usersAPI, projectsAPI, tasksAPI, dashboardAPI } from './api';
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
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B0C' }}>
    <div className="spinner"></div>
  </div>
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0B0B0C 0%, #1F1F23 100%)', padding: '20px' }}>
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(192,24,31,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(184,134,43,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      
      <div className="card" style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Building2 size={36} color="#B8862B" />
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>ARC Project Management</h1>
          </div>
          <p style={{ color: 'rgba(245,241,232,0.6)' }}>Sign in to manage your projects and tasks</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(192,24,31,0.2)', border: '1px solid rgba(192,24,31,0.4)', borderRadius: '12px', padding: '12px', marginBottom: '20px', color: '#FF6B6B', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Email Address</label>
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
            <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Password</label>
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

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(184,134,43,0.1)', borderRadius: '12px', fontSize: '13px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', color: '#B8862B' }}>Test Credentials:</p>
          <p style={{ color: 'rgba(245,241,232,0.7)' }}>CEO: sadi@arc.com / 12345678</p>
          <p style={{ color: 'rgba(245,241,232,0.7)' }}>Finance: maureen.bangu@ar-consurt-world.com / 12345678</p>
          <p style={{ color: 'rgba(245,241,232,0.7)' }}>Operations: juma.h.kasele@gmail.com / 11223344</p>
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

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/tasks', icon: CheckSquare, label: 'Task Board' },
    { path: '/team', icon: Users, label: 'Team' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="modal-overlay" style={{ zIndex: 39 }} onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={32} color="#B8862B" />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>ARC</h2>
              <p style={{ fontSize: '11px', color: 'rgba(245,241,232,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
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

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid rgba(184,134,43,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(11,11,12,0.4)', borderRadius: '12px', marginBottom: '12px' }}>
            <img src={user?.avatar} alt={user?.name} className="avatar" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', color: '#C0181F' }}>
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
          <button onClick={onMenuClick} className="btn btn-secondary" style={{ padding: '8px', display: 'none' }} id="menu-toggle">
            <Menu size={20} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#C0181F', borderRadius: '50%' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={user?.avatar} alt={user?.name} className="avatar" />
            <span style={{ fontWeight: '500' }}>{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==================== DASHBOARD PAGE ====================
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, tasksRes, activitiesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getMyTasks(),
        dashboardAPI.getActivities({ limit: 10 })
      ]);
      setStats(statsRes.data);
      setMyTasks(tasksRes.data);
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
    <div style={{ padding: '24px' }}>
      {/* Welcome Section */}
      <div className="card card-gold" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p style={{ color: 'rgba(245,241,232,0.7)' }}>Here's what's happening with your projects today.</p>
          </div>
          <Link to="/tasks" className="btn btn-primary">
            <Plus size={18} />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card stat-card">
          <FolderKanban size={28} color="#B8862B" style={{ marginBottom: '12px' }} />
          <div className="stat-value">{stats?.overview?.total_projects || 0}</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="card stat-card">
          <CheckSquare size={28} color="#81C784" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ color: '#81C784' }}>{stats?.overview?.completed_tasks || 0}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="card stat-card">
          <Activity size={28} color="#64B5F6" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ color: '#64B5F6' }}>{stats?.overview?.in_progress_tasks || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="card stat-card">
          <AlertTriangle size={28} color="#FF6B6B" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ color: '#FF6B6B' }}>{stats?.overview?.overdue_tasks || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>My Tasks</h3>
            <Link to="/tasks" style={{ color: '#B8862B', fontSize: '14px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {myTasks.length === 0 ? (
            <p style={{ color: 'rgba(245,241,232,0.5)', textAlign: 'center', padding: '20px' }}>No pending tasks</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myTasks.slice(0, 5).map(task => (
                <div key={task.id} className="task-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{task.title}</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.5)' }}>{task.project_name}</p>
                    </div>
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  </div>
                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: isPast(new Date(task.due_date)) ? '#FF6B6B' : 'rgba(245,241,232,0.5)' }}>
                      <Calendar size={14} />
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Recent Activity</h3>
          {activities.length === 0 ? (
            <p style={{ color: 'rgba(245,241,232,0.5)', textAlign: 'center', padding: '20px' }}>No recent activity</p>
          ) : (
            <div>
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <Activity size={16} color="#B8862B" style={{ marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px' }}>
                      <span style={{ fontWeight: '600' }}>{activity.user_name}</span>
                      <span style={{ color: 'rgba(245,241,232,0.6)' }}> {activity.action.replace(/_/g, ' ')}</span>
                      {activity.entity_name && <span style={{ color: '#B8862B' }}> "{activity.entity_name}"</span>}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.4)', marginTop: '4px' }}>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Performance (CEO/Operations only) */}
      {(user?.role === 'ceo' || user?.role === 'operations') && teamPerformance.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Team Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teamPerformance.map(member => (
              <div key={member.id} className="team-member-row">
                <img src={member.avatar} alt={member.name} className="avatar" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>{member.name}</span>
                    <span className={`role-badge role-${member.role}`}>{member.role}</span>
                  </div>
                  <div className="progress-bar" style={{ maxWidth: '200px' }}>
                    <div className="progress-fill" style={{ width: `${member.completion_rate}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', color: '#B8862B' }}>{member.completion_rate}%</p>
                  <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.5)' }}>{member.completed}/{member.total_tasks} tasks</p>
                </div>
                {member.overdue > 0 && (
                  <span className="priority-badge priority-urgent">{member.overdue} overdue</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PROJECTS PAGE ====================
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', client_name: '', project_type: 'General',
    contract_value: '', start_date: '', end_date: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create({
        ...formData,
        contract_value: parseFloat(formData.contract_value) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      });
      setShowModal(false);
      setFormData({ name: '', description: '', client_name: '', project_type: 'General', contract_value: '', start_date: '', end_date: '' });
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create project');
    }
  };

  const canCreateProject = ['ceo', 'finance', 'operations'].includes(user?.role);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Projects</h2>
          <p style={{ color: 'rgba(245,241,232,0.6)' }}>{projects.length} active projects</p>
        </div>
        {canCreateProject && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="create-project-btn">
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {projects.map(project => (
          <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#B8862B', textTransform: 'uppercase', letterSpacing: '1px' }}>{project.project_number}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>{project.name}</h3>
              </div>
              <span className="status-badge status-active">{project.status}</span>
            </div>
            
            {project.description && (
              <p style={{ color: 'rgba(245,241,232,0.6)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(245,241,232,0.6)' }}>
                <Building2 size={14} />
                {project.client_name || 'No client'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(245,241,232,0.6)' }}>
                <DollarSign size={14} />
                {project.contract_value?.toLocaleString() || '0'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                <span style={{ color: 'rgba(245,241,232,0.6)' }}>Progress</span>
                <span style={{ color: '#B8862B', fontWeight: '600' }}>{project.task_stats?.progress || 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.task_stats?.progress || 0}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '-8px' }}>
                {project.assigned_users_info?.slice(0, 3).map((u, i) => (
                  <img key={u.id} src={u.avatar} alt={u.name} className="avatar avatar-sm" style={{ marginLeft: i > 0 ? '-8px' : 0 }} />
                ))}
                {project.assigned_users_info?.length > 3 && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(245,241,232,0.5)' }}>+{project.assigned_users_info.length - 3}</span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(245,241,232,0.5)' }}>
                {project.task_stats?.completed || 0}/{project.task_stats?.total || 0} tasks
              </span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FolderKanban size={48} color="rgba(184,134,43,0.3)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ color: 'rgba(245,241,232,0.5)', marginBottom: '24px' }}>Create your first project to get started</p>
          {canCreateProject && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} />
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Project</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#F5F1E8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter project name"
                    required
                    data-testid="project-name-input"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Project description"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="input"
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Project Type</label>
                    <select
                      value={formData.project_type}
                      onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
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
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Contract Value</label>
                  <input
                    type="number"
                    value={formData.contract_value}
                    onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="submit-project-btn">Create Project</button>
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
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', project_id: '', assigned_to: '', priority: 'medium', due_date: '', estimated_hours: ''
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: '#9E9E9E' },
    { id: 'in_progress', title: 'In Progress', color: '#2196F3' },
    { id: 'review', title: 'Review', color: '#9C27B0' },
    { id: 'done', title: 'Done', color: '#4CAF50' }
  ];

  useEffect(() => {
    loadData();
  }, [filterProject]);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        tasksAPI.getAll({ project_id: filterProject || undefined }),
        projectsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
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
        estimated_hours: parseFloat(formData.estimated_hours) || null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      });
      setShowModal(false);
      setFormData({ title: '', description: '', project_id: '', assigned_to: '', priority: 'medium', due_date: '', estimated_hours: '' });
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
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Task Board</h2>
          <p style={{ color: 'rgba(245,241,232,0.6)' }}>Drag and drop tasks to update their status</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="input"
            style={{ width: '200px' }}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
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
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: column.color }} />
                <h4 style={{ fontWeight: '600' }}>{column.title}</h4>
              </div>
              <span style={{ background: 'rgba(184,134,43,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
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
                  {task.project_name && (
                    <p style={{ fontSize: '12px', color: '#B8862B', marginBottom: '8px' }}>{task.project_name}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.assigned_user && (
                        <img src={task.assigned_user.avatar} alt={task.assigned_user.name} className="avatar avatar-sm" title={task.assigned_user.name} />
                      )}
                      {task.due_date && (
                        <span style={{ fontSize: '11px', color: isPast(new Date(task.due_date)) && column.id !== 'done' ? '#FF6B6B' : 'rgba(245,241,232,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {task.comment_count > 0 && (
                      <span style={{ fontSize: '11px', color: 'rgba(245,241,232,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                        style={{ padding: '4px 8px', fontSize: '10px', background: 'rgba(184,134,43,0.1)', border: '1px solid rgba(184,134,43,0.3)', borderRadius: '6px', color: '#B8862B', cursor: 'pointer' }}
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
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#F5F1E8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Task Title *</label>
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
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Description</label>
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
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Project *</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="input"
                    required
                    data-testid="task-project-select"
                  >
                    <option value="">Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Assign To</label>
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
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Priority</label>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Estimated Hours</label>
                    <input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
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
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#C0181F', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#F5F1E8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{task.title}</h2>
          <p style={{ color: '#B8862B', fontSize: '13px', marginBottom: '16px' }}>{task.project_name}</p>
          
          {task.description && (
            <p style={{ color: 'rgba(245,241,232,0.7)', marginBottom: '20px', lineHeight: '1.6' }}>{task.description}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(245,241,232,0.5)', marginBottom: '6px' }}>Status</label>
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
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(245,241,232,0.5)', marginBottom: '6px' }}>Assigned To</label>
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

          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '13px' }}>
            {task.due_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(245,241,232,0.6)' }}>
                <Calendar size={16} />
                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            )}
            {task.estimated_hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(245,241,232,0.6)' }}>
                <Clock size={16} />
                Est: {task.estimated_hours}h
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid rgba(184,134,43,0.2)', paddingTop: '20px' }}>
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
                      <span style={{ fontSize: '11px', color: 'rgba(245,241,232,0.4)' }}>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(245,241,232,0.8)', lineHeight: '1.5' }}>{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p style={{ color: 'rgba(245,241,232,0.4)', fontSize: '14px' }}>No comments yet</p>
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

// ==================== TEAM PAGE ====================
const TeamPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'worker', department: '', phone: ''
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
      await usersAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'worker', department: '', phone: '' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
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

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Team</h2>
          <p style={{ color: 'rgba(245,241,232,0.6)' }}>{users.length} team members</p>
        </div>
        {canManageUsers && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-member-btn">
            <Plus size={18} />
            Add Member
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {['ceo', 'finance', 'operations', 'worker'].map(role => (
          <div key={role} className="card stat-card">
            <div className={`role-badge role-${role}`} style={{ marginBottom: '8px' }}>{role}</div>
            <div className="stat-value" style={{ fontSize: '24px' }}>{users.filter(u => u.role === role).length}</div>
          </div>
        ))}
      </div>

      {/* Team Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {users.map(member => (
          <div key={member.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <img src={member.avatar} alt={member.name} className="avatar avatar-lg" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ fontWeight: '600' }}>{member.name}</h4>
                  {!member.is_active && (
                    <span style={{ fontSize: '10px', background: 'rgba(192,24,31,0.2)', color: '#C0181F', padding: '2px 6px', borderRadius: '4px' }}>Inactive</span>
                  )}
                </div>
                <span className={`role-badge role-${member.role}`}>{member.role}</span>
                <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.5)', marginTop: '8px' }}>{member.email}</p>
                {member.department && (
                  <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.4)', marginTop: '4px' }}>{member.department}</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(11,11,12,0.4)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(245,241,232,0.5)' }}>Task Completion</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#B8862B' }}>{member.stats?.completion_rate || 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${member.stats?.completion_rate || 0}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'rgba(245,241,232,0.5)' }}>
                <span>{member.stats?.completed_tasks || 0} completed</span>
                <span>{member.stats?.in_progress || 0} in progress</span>
                <span>{member.stats?.total_tasks || 0} total</span>
              </div>
            </div>

            {canManageUsers && user?.role === 'ceo' && member.id !== user.id && (
              <button
                onClick={() => handleToggleStatus(member.id)}
                className={`btn ${member.is_active ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {member.is_active ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Add Team Member</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#F5F1E8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter full name"
                    required
                    data-testid="member-name-input"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="Enter email"
                    required
                    data-testid="member-email-input"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    placeholder="Enter password"
                    required
                    data-testid="member-password-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="worker">Worker</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                      {user?.role === 'ceo' && <option value="ceo">CEO</option>}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input"
                      placeholder="e.g., Finance"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(245,241,232,0.7)', marginBottom: '8px' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="submit-member-btn">Add Member</button>
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
      case '/projects': return 'Projects';
      case '/tasks': return 'Task Board';
      case '/team': return 'Team';
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
            path="/projects"
            element={
              <ProtectedRoute>
                <MainLayout><ProjectsPage /></MainLayout>
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
