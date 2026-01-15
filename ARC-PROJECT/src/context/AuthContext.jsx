import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  verifyCEOCredentials,
  isUserAuthorized,
  getUserByEmailAndRole,
  getCEOInfo,
} from '../utils/database';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('arc_user');
    const storedAuth = localStorage.getItem('arc_auth');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('arc_user');
        localStorage.removeItem('arc_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, requestedRole = null) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }

        // Check if CEO
        if (verifyCEOCredentials(email, password)) {
          const ceoInfo = getCEOInfo();
          const userData = {
            id: 'ceo-1',
            name: ceoInfo.name || 'CEO',
            email: ceoInfo.email,
            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(ceoInfo.name || 'CEO')}&background=C0181F&color=fff`,
            role: 'ceo',
            isCEO: true,
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('arc_user', JSON.stringify(userData));
          localStorage.setItem('arc_auth', 'true');
          resolve(userData);
          return;
        }

        // If requestedRole is provided, check that specific role
        if (requestedRole && (requestedRole === 'finance' || requestedRole === 'operations')) {
          if (isUserAuthorized(email, requestedRole)) {
            const authorizedUser = getUserByEmailAndRole(email, requestedRole);
            const userData = {
              id: authorizedUser.id,
              name: authorizedUser.name,
              email: authorizedUser.email,
              profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorizedUser.name)}&background=B8862B&color=fff`,
              role: requestedRole,
              isAuthorized: true,
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('arc_user', JSON.stringify(userData));
            localStorage.setItem('arc_auth', 'true');
            resolve(userData);
            return;
          } else {
            reject(new Error(`You are not authorized to access the ${requestedRole} role. Please contact the CEO for access.`));
            return;
          }
        }

        // If no role specified, check if user is authorized for any role
        if (!requestedRole) {
          // Check finance first
          if (isUserAuthorized(email, 'finance')) {
            const authorizedUser = getUserByEmailAndRole(email, 'finance');
            const userData = {
              id: authorizedUser.id,
              name: authorizedUser.name,
              email: authorizedUser.email,
              profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorizedUser.name)}&background=B8862B&color=fff`,
              role: 'finance',
              isAuthorized: true,
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('arc_user', JSON.stringify(userData));
            localStorage.setItem('arc_auth', 'true');
            resolve(userData);
            return;
          }
          
          // Check operations
          if (isUserAuthorized(email, 'operations')) {
            const authorizedUser = getUserByEmailAndRole(email, 'operations');
            const userData = {
              id: authorizedUser.id,
              name: authorizedUser.name,
              email: authorizedUser.email,
              profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorizedUser.name)}&background=B8862B&color=fff`,
              role: 'operations',
              isAuthorized: true,
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('arc_user', JSON.stringify(userData));
            localStorage.setItem('arc_auth', 'true');
            resolve(userData);
            return;
          }
        }

        // Default: reject if not CEO and not authorized for any role
        reject(new Error('Invalid credentials or insufficient permissions. Please contact the CEO for access.'));
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('arc_user');
    localStorage.removeItem('arc_auth');
  };

  const isHost = user?.role === 'host' || user?.role === 'admin' || user?.role === 'ceo';

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    isHost,
    isCEO: user?.role === 'ceo',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
