import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await dispatch(updateUserProfile({ _id: userInfo._id, name, email, password, image })).unwrap();
      toast.success('Profile Updated Successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.text();
      setImage(data);
      toast.success('Image uploaded! Click Update Profile to save.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pt-8 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
            <label htmlFor="image-upload" className="w-full h-full rounded-full overflow-hidden block border-2 border-primary/30 group-hover:border-primary transition-colors cursor-pointer relative shadow-lg">
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Change</span>
              </div>
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={uploadFileHandler}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image-upload" className="inline-block text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:text-white transition-colors bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 hover:bg-primary/20">
              Choose Image
            </label>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
          <p className="text-gray-400">Update your account details and picture.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Change Password</h3>
            <div className="space-y-6">
              <Input
                label="New Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (optional)"
              />
              <Input
                label="Confirm New Password"
                type="password"
                icon={CheckCircle}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-8"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>

          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
