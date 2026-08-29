import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock } from 'lucide-react';
import { registerUser } from '../redux/slices/authSlice';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { userInfo, loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    if (userInfo) navigate(redirect ? `/${redirect}` : '/');
  }, [userInfo, navigate, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    setLocalError('');
    if (password.length < 6) return setLocalError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setLocalError('Passwords do not match');
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-fg font-semibold hover:text-primary transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      {(localError || error) && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2.5 rounded-xl mb-5 text-sm text-center">
          {localError || error}
        </div>
      )}

      <form onSubmit={submitHandler} className="space-y-1">
        <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required icon={User} />
        <Input label="Email Address" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={Mail} />
        <Input label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required icon={Lock} />
        <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={Lock} />

        <Button type="submit" className="w-full !mt-6 py-3.5 text-sm font-semibold rounded-xl" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
