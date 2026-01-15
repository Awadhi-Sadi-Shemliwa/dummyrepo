import React from 'react';
import { NavLink } from 'react-router-dom';
import { useArc } from './ArcContext';

const roleConfig = {
  ceo: {
    label: 'CEO Console',
    links: [{ to: '/ceo', label: 'Executive Dashboard' }],
  },
  finance: {
    label: 'Finance Officer',
    links: [{ to: '/finance', label: 'Financial Setup' }],
  },
  operations: {
    label: 'Operations & Quality',
    links: [{ to: '/operations', label: 'Execution Setup' }],
  },
};

const RoleNav = () => {
  const { role, officer } = useArc();
  const config = roleConfig[role] || roleConfig.ceo;

  return (
    <header className="sticky top-0 z-20 border-b border-brand-gold/20 bg-brand-black/95 backdrop-blur shadow-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70">ARC Internal System</p>
          <h1 className="text-lg font-semibold text-white">{config.label}</h1>
        </div>
        <nav className="flex items-center gap-6">
          {config.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm uppercase tracking-[0.2em] transition-colors ${
                  isActive ? 'text-brand-gold' : 'text-brand-sand/70 hover:text-brand-gold'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {role === 'ceo' && (
            <NavLink
              to="/permissions"
              className="rounded-full border border-brand-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:text-white"
            >
              Manage Access
            </NavLink>
          )}
          <NavLink
            to="/access"
            className="rounded-full border border-brand-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:text-white"
          >
            Switch Role
          </NavLink>
        </nav>
        <div className="hidden text-right text-xs text-brand-sand/70 md:block">
          <p className="uppercase tracking-[0.3em] text-brand-gold/70">Signed In</p>
          <p className="text-sm text-white">{officer.name}</p>
        </div>
      </div>
    </header>
  );
};

export default RoleNav;