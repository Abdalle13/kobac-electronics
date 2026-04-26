import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(registerUser({ name, email, password }));
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 w-full">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-xl max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h1>
        
        {message && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <Input 
            label="Full Name"
            type="text" 
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input 
            label="Email Address"
            type="email" 
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password"
            type="password" 
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            label="Confirm Password"
            type="password" 
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            className="w-full mt-4 py-3 h-[48px]"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-[var(--color-primary)] hover:text-white transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
