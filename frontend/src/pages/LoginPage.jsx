import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock } from 'lucide-react';
import { login } from '../redux/slices/authSlice';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { userInfo, loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    if (userInfo) {
      if (redirect) navigate(`/${redirect}`);
      else navigate(userInfo.role?.toLowerCase() === 'admin' ? '/dashboard' : '/');
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Kobac Electronics account."
      footer={
        <>
          New here?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-fg font-semibold hover:text-primary transition-colors">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2.5 rounded-xl mb-5 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={submitHandler} className="space-y-1">
        <Input label="Email Address" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={Mail} />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required icon={Lock} />

        <div className="flex justify-end pt-1">
          <Link to="/forgot-password" className="text-xs text-muted hover:text-primary transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full !mt-6 py-3.5 text-sm font-semibold rounded-xl" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
