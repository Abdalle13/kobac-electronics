import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, Zap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // redirect to where the user was trying to go or home
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      if (!location.search && userInfo.role && userInfo.role.toLowerCase() === 'admin') {
        navigate('/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [userInfo, navigate, redirect, location.search]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 w-full relative">
      {/* Abstract background elements for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass border border-white/[0.08] p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 overflow-hidden">
            <img src="/favicon.svg" alt="Kobac Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Kobac Electronics</h2>
          <h1 className="text-3xl font-black text-white tracking-tighter">Sign In</h1>
          <p className="text-gray-500 text-sm mt-2">Welcome back! Please enter your details.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-[11px] font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-2">
          <Input 
            label="Email Address"
            type="email" 
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={Mail}
          />
          <Input 
            label="Password"
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Lock}
          />
          
          <Button 
            type="submit" 
            className="w-full !mt-8 py-4 h-auto text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-[13px] text-gray-500">
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-white font-bold hover:text-primary transition-colors">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
