import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPassword, clearAuthStatus } from '../redux/slices/authSlice';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={message ? undefined : "Enter your email and we'll send you a reset link."}
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-muted hover:text-fg transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      }
    >
      {message ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/15 text-success mb-4">
            <MailCheck className="w-7 h-7" />
          </div>
          <p className="text-muted text-sm">{message}</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2.5 rounded-xl mb-5 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={submitHandler} className="space-y-1">
            <Input label="Email Address" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={Mail} />
            <Button type="submit" className="w-full !mt-6 py-3.5 text-sm font-semibold rounded-xl" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
