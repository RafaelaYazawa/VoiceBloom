import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, addToast } = useStore();
  
  const isRegister = new URLSearchParams(location.search).get('register') === 'true';
  const [isRegistering, setIsRegistering] = useState(isRegister);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering && password !== confirmPassword) {
      addToast({
        title: 'Passwords do not match',
        type: 'error',
      });
      return;
    }
    
    // Demo authentication - in a real app, this would make API calls
    try {
      login(email, password);
      
      addToast({
        title: isRegistering ? 'Account created!' : 'Welcome back!',
        type: 'success',
      });
      
      navigate('/record');
    } catch (error) {
      addToast({
        title: 'Authentication error',
        description: 'Please check your credentials and try again.',
        type: 'error',
      });
    }
  };
  
  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    // Update URL without full page reload
    const newSearch = isRegistering ? '' : '?register=true';
    navigate({ search: newSearch }, { replace: true });
  };
  
  return (
    <div className="max-w-md mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-sm border"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
            <Mic className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">
            {isRegistering ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRegistering
              ? 'Join VoiceBloom and start building your speaking confidence'
              : 'Sign in to continue your speaking practice'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          
          {isRegistering && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="btn-primary w-full"
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary hover:underline font-medium"
            >
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;