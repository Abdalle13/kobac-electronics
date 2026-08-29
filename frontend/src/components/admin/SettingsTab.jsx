import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { fetchSettings } from '../../redux/slices/settingsSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';

const Card = ({ title, subtitle, children }) => (
  <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8">
    <div className="mb-6 border-b border-line pb-5">
      <h3 className="text-lg font-black text-fg mb-1">{title}</h3>
      {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const SettingsTab = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);

  const [store, setStore] = useState({ storeName: '', supportEmail: '', supportPhone: '', freeShippingThreshold: 400, heroBanners: [] });
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingBanners, setSavingBanners] = useState(false);

  const [profile, setProfile] = useState({ name: userInfo?.name || '', email: userInfo?.email || '', password: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => setStore({ heroBanners: [], ...res.data }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (payload, setSaving, msg) => {
    setSaving(true);
    try {
      await api.put('/settings', payload);
      dispatch(fetchSettings()); // refresh app-wide settings (promo bar, checkout, contact)
      toast.success(msg);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd);
      setStore((s) => ({ ...s, heroBanners: [...s.heroBanners, res.data] }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (profile.password !== profile.confirmPassword) return toast.error('Passwords do not match');
    setSavingProfile(true);
    try {
      await api.put('/users/profile', { name: profile.name, email: profile.email, password: profile.password });
      toast.success('Profile updated — some changes may require re-login');
      setProfile((p) => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-muted">Loading settings…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <Card title="Store Configuration" subtitle="Identity, support contact and shipping. Changes apply across the storefront.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Store Name" value={store.storeName} onChange={(e) => setStore({ ...store, storeName: e.target.value })} placeholder="Kobac Electronics" />
            <Input label="Free Shipping Threshold ($)" type="number" value={store.freeShippingThreshold}
              onChange={(e) => setStore({ ...store, freeShippingThreshold: Number(e.target.value) })} placeholder="400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Support Email" type="email" value={store.supportEmail} onChange={(e) => setStore({ ...store, supportEmail: e.target.value })} placeholder="support@kobac.com" />
            <Input label="Support Phone" value={store.supportPhone} onChange={(e) => setStore({ ...store, supportPhone: e.target.value })} placeholder="+252 61 XXXXXXX" />
          </div>
          <div className="flex justify-end">
            <Button disabled={savingStore} onClick={() => persist(store, setSavingStore, 'Store settings saved')} className="px-8 text-xs font-black uppercase tracking-widest">
              {savingStore ? 'Saving…' : 'Save Store Info'}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Home Page Banners" subtitle="Optional hero images for the storefront.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {store.heroBanners.map((b, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-line">
              <img src={b} className="w-full h-full object-cover" alt="Banner" />
              <button
                onClick={() => setStore((s) => ({ ...s, heroBanners: s.heroBanners.filter((_, idx) => idx !== i) }))}
                className="absolute top-2 right-2 bg-danger p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          ))}
          <label htmlFor="banner-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-line rounded-xl aspect-video bg-surface-2 cursor-pointer hover:border-primary/40 transition-colors">
            <Plus className="text-muted mb-2" />
            <span className="text-muted text-xs font-bold uppercase tracking-widest">Add Banner</span>
            <input type="file" id="banner-upload" hidden onChange={uploadBanner} />
          </label>
        </div>
        <div className="flex justify-end pt-4 border-t border-line">
          <Button disabled={savingBanners} onClick={() => persist(store, setSavingBanners, 'Banners updated')} className="px-8">
            {savingBanners ? 'Saving…' : 'Apply Banners'}
          </Button>
        </div>
      </Card>

      <Card title="Admin Profile" subtitle="Your personal account details and password.">
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div className="p-4 rounded-2xl bg-surface-2 border border-line">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Change Password</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="New Password" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="••••••••" />
              <Input label="Confirm Password" type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <p className="text-[10px] text-muted mt-2">Leave blank to keep your current password.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingProfile} className="px-10 text-xs font-black uppercase tracking-widest">
              {savingProfile ? 'Saving…' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsTab;
