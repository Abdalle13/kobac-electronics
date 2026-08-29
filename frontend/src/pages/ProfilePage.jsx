import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Camera, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../utils/api';

const Card = ({ title, subtitle, children }) => (
  <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7">
    <div className="mb-5">
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { userInfo, loading } = useSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const save = async (payload, onDone) => {
    try {
      await dispatch(updateUserProfile({ _id: userInfo._id, ...payload })).unwrap();
      toast.success('Saved');
      onDone?.();
    } catch (err) {
      toast.error(err || 'Could not save changes');
    }
  };

  const saveAccount = (e) => {
    e.preventDefault();
    save({ name, email, image });
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setSavingPw(true);
    await save({ name, email, image, password }, () => {
      setPassword('');
      setConfirmPassword('');
    });
    setSavingPw(false);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd);
      setImage(data);
      await save({ name, email, image: data });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">My Account</h1>

      {/* Identity header */}
      <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary flex items-center justify-center text-on-primary text-2xl font-bold">
            {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
          </div>
          <label
            htmlFor="avatar"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-canvas border border-line flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            title="Change photo"
          >
            {uploading ? <Loader2 size={13} className="animate-spin text-primary" /> : <Camera size={13} className="text-muted" />}
            <input id="avatar" type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </label>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-fg truncate">{name}</p>
          <p className="text-sm text-muted truncate">{email}</p>
        </div>
      </div>

      {/* Account details */}
      <Card title="Account details" subtitle="Your name and email address.">
        <form onSubmit={saveAccount} className="space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card title="Password" subtitle="Set a new password for signing in.">
        <form onSubmit={savePassword} className="space-y-4">
          <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <div className="flex justify-end">
            <Button type="submit" disabled={savingPw || !password}>{savingPw ? 'Updating…' : 'Update password'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
