import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { resetPassword, clearAuthStatus } from '../redux/slices/authSlice';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password.length < 6) return setLocalError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setLocalError('Passwords do not match');

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password updated. You are now signed in.');
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter and confirm your new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="text-fg font-semibold hover:text-primary transition-colors">Sign in</Link>
        </>
      }
    >
      {(localError || error) && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2.5 rounded-xl mb-5 text-sm text-center">
          {localError || error}
        </div>
      )}
      <form onSubmit={submitHandler} className="space-y-1">
        <Input label="New Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required icon={Lock} />
        <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={Lock} />
        <Button type="submit" className="w-full !mt-6 py-3.5 text-sm font-semibold rounded-xl" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
