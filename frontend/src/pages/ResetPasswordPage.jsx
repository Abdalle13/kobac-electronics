import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { resetPassword, clearAuthStatus } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password updated. You are now signed in.');
      navigate('/');
    }
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
          <h2 className="text-sm font-semibold text-primary mb-2">Kobac Electronics</h2>
          <h1 className="text-3xl font-bold text-fg tracking-tight">New Password</h1>
          <p className="text-muted text-sm mt-2">Choose a new password for your account.</p>
        </div>

        {(localError || error) && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl mb-6 text-[11px] font-bold uppercase tracking-wider text-center">
            {localError || error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-1">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Lock}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            icon={Lock}
          />

          <Button
            type="submit"
            className="w-full !mt-8 py-4 h-auto text-sm font-semibold rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-line text-center text-[13px] text-muted">
          Remembered it?{' '}
          <Link to="/login" className="text-fg font-bold hover:text-primary transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
