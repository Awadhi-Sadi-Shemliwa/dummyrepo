import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import arcLogo from '../../assets/logo.png';
import { Menu, X, Sun, Moon, User, LogOut, Heart, Calendar, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout, isHost } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
  };

  const navLinks = [
    { name: 'Features', path: '#features' },
    { name: 'Workflow', path: '#workflow' },
    { name: 'Outcomes', path: '#cta' },
  ];

  return (
    <nav className="bg-brand-black/95 backdrop-blur shadow-sm sticky top-0 z-50 border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenus}>
          <img src={arcLogo} alt="ARC Actuarial and Risk Consulting" className="h-10 object-contain" />
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 border-transparent text-brand-sand/80 hover:text-white hover:border-brand-gold"
                  onClick={closeMenus}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                    src={user?.profileImage}
                    alt={user?.name}
                  />
                  <span className="hidden lg:block text-brand-sand/80">{user?.name}</span>
                  <ChevronDown size={16} className="text-brand-sand/60" />
                </button>
                
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-brand-slate border border-white/10 focus:outline-none">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                    </div>
                    <Link
                      to="/settings"
                      className="block w-full text-left px-4 py-2 text-sm text-brand-sand/80 hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex items-center">
                        <Settings size={16} className="mr-2" />
                        Settings
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-white/5 hover:text-brand-red/80"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                <Button size="sm">Request Access</Button></Link>

                </div>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-brand-sand/80 hover:bg-white/5 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
                <a
                key={link.path}
                href={link.path}
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-brand-sand/80 hover:bg-white/5 hover:border-brand-gold"
                onClick={closeMenus}
              >
                {link.name}
                </a>
            ))}
          </div>
          
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-brand-red"
                    src={user?.profileImage}
                    alt={user?.name}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-brand-sand/60">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to={isHost ? "/host/dashboard" : "/dashboard"}
                  className="block px-4 py-2 text-base font-medium text-brand-sand/80 hover:bg-white/5 hover:text-white"
                  onClick={closeMenus}
                >
                  {isHost ? "Host Dashboard" : "Dashboard"}
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-brand-red hover:bg-white/5 hover:text-brand-red/80"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-white/10 px-4 flex flex-col space-y-2">
              <Link to="/login" onClick={closeMenus}>
                <Button variant="outline" fullWidth>Sign In</Button>
              </Link>
              <Link to="/register" onClick={closeMenus}>
                <Button fullWidth>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;