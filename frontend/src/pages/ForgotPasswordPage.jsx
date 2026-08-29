import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPassword, clearAuthStatus } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 w-full relative">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass border border-line p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-2 border border-line mb-4 overflow-hidden">
            <img src="/favicon.svg" alt="Kobac Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Kobac Electronics</h2>
          <h1 className="text-3xl font-black text-fg tracking-tighter">Reset Password</h1>
          <p className="text-muted text-sm mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {message ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/15 text-success mb-4">
              <MailCheck className="w-7 h-7" />
            </div>
            <p className="text-muted text-sm mb-8">{message}</p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl mb-6 text-[11px] font-bold uppercase tracking-wider text-center">
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

              <Button
                type="submit"
                className="w-full !mt-8 py-4 h-auto text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-line text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-fg transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
