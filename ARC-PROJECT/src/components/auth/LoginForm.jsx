import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import arcLogo from '../../assets/logo.png';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'ceo') {
        navigate('/ceo', { replace: true });
      } else if (user.role === 'finance') {
        navigate('/finance', { replace: true });
      } else if (user.role === 'operations') {
        navigate('/operations', { replace: true });
      } else {
        navigate('/access', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, authLoading]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const userData = await login(email, password);
      // Redirect based on user role
      if (userData.role === 'ceo') {
        navigate('/ceo');
      } else if (userData.role === 'finance') {
        navigate('/finance');
      } else if (userData.role === 'operations') {
        navigate('/operations');
      } else {
        // Default: go to access portal for role selection
        navigate('/access');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-brand-red/30 blur-[140px] animate-glow" />
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-brand-gold/30 blur-[140px] animate-glow" />
        </div>

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-8">
          <img src={arcLogo} alt="ARC Actuarial and Risk Consulting" className="mx-auto h-12 object-contain" />
          <h2 className="mt-6 text-3xl font-semibold text-white">Welcome back</h2>
          <p className="text-brand-sand/70 mt-2">Sign in to your ARC FlowSuite workspace.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-red/20 text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

    <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              leftIcon={<Mail size={18} className="text-brand-sand/60" />}
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              leftIcon={<Lock size={18} className="text-brand-sand/60" />}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-brand-sand/70">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/10 text-brand-red focus:ring-brand-red"
              />
              <span className="ml-2">Remember me</span>
            </label>

            <Link to="/forgot-password" className="text-brand-gold hover:text-brand-gold/80">
              Forgot password?
            </Link>
          </div>
        
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            leftIcon={!isLoading ? <LogIn size={18} /> : undefined}
          >
            Sign In
          </Button>
        </form>
      
        <div className="mt-6 text-center">
          <p className="text-sm text-brand-sand/70">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-gold hover:text-brand-gold/80 font-medium">
              Request access
            </Link>
          </p>
        </div>
      
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-brand-sand/70">
          Need help? Contact the ARC operations team to set up multi-office access.
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
