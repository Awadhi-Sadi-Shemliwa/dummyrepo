import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArc } from '../components/auth/ArcContext';
import { useAuth } from '../context/AuthContext';
import { isUserAuthorized, verifyCEOCredentials } from '../utils/database';

const roles = [
  {
    id: 'ceo',
    title: 'CEO (Boss)',
    description: 'Executive-grade visibility with strict read-only control.',
    focus: 'Strategic oversight & decision velocity.',
    route: '/ceo',
  },
  {
    id: 'finance',
    title: 'Finance Officer',
    description: 'Creates contracts, controls every financial variable.',
    focus: 'Profit discipline & contract accuracy.',
    route: '/finance',
  },
  {
    id: 'operations',
    title: 'Operations & Quality Officer',
    description: 'Builds execution structures, timelines, staff plans.',
    focus: 'Delivery precision & quality control.',
    route: '/operations',
  },
];

const AccessPortal = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useArc();
  const { user, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');

  const handleEnter = async (role) => {
    setError('');
    setSelectedRole(role);

    // CEO can access directly if logged in
    if (role.id === 'ceo') {
      if (user?.role === 'ceo') {
        setActiveRole(role.id, name || user.name);
        navigate(role.route);
        return;
      }
      // Try to login as CEO
      try {
        await login(email || 'ceo@arc.com', password || 'ceo123', 'ceo');
        setActiveRole(role.id, name || 'CEO');
        navigate(role.route);
      } catch (err) {
        setError('Invalid CEO credentials. Default: ceo@arc.com / ceo123');
      }
      return;
    }

    // Finance and Operations require authentication
    if (!email || !password) {
      setError(`Please enter your email and password to access ${role.title}`);
      return;
    }

    try {
      await login(email, password, role.id);
      setActiveRole(role.id, name || role.title);
      navigate(role.route);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please contact the CEO for access.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">ARC · Actuarial & Risk Consulting</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            ARC Project Management System
          </h1>
          <p className="max-w-3xl text-lg text-brand-white/70">
            Contract signature initiates immediate project execution. The CEO assigns roles to
            Finance and Operations leadership to activate financial controls and delivery execution.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-brand-gold/30 bg-brand-black/60 p-8 shadow-arc brand-glow">
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-sm text-brand-white/60">
              CEO has full access. Finance and Operations officers must be authorized by the CEO.
            </p>
            {error && (
              <div className="p-3 rounded-2xl border border-brand-red/50 bg-brand-red/10 text-brand-red text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                className="w-full rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white placeholder:text-brand-white/40 focus:border-brand-gold focus:outline-none"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white placeholder:text-brand-white/40 focus:border-brand-gold focus:outline-none"
              />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Display name (optional)"
                className="w-full rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-sm text-brand-white placeholder:text-brand-white/40 focus:border-brand-gold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-brand-gold/60">
              <span>Contract → Project</span>
              <span>Auto Profit Logic</span>
              <span>Executive Oversight</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
              <h3 className="text-lg font-semibold">Workflow Snapshot</h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-white/70">
                <li>1. Contract presented to CEO and formally signed.</li>
                <li>2. Signed contract becomes an active project instantly.</li>
                <li>3. CEO assigns Finance + Operations leaders to execute.</li>
                <li>4. Profit, staff, and timelines are tracked in real time.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-brand-gold/20 bg-brand-black/70 p-6">
              <h3 className="text-lg font-semibold">Core Roles</h3>
              <p className="mt-3 text-sm text-brand-white/70">
                Each role has its own protected route, navigation, and permissions. Select a role
                below to enter the system.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => handleEnter(role)}
              className="group rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-6 text-left transition hover:border-brand-gold hover:shadow-arc"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">{role.title}</p>
              <h3 className="mt-3 text-lg font-semibold text-brand-white">{role.description}</h3>
              <p className="mt-4 text-sm text-brand-white/60">{role.focus}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-gold transition group-hover:text-brand-white">
                Enter Module →
              </span>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AccessPortal;
