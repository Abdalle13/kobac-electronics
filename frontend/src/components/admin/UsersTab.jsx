import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Power, Plus } from 'lucide-react';
import api from '../../utils/api';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from './Modal';
import AdminTable, { EmptyRow } from './AdminTable';

const ROLES = ['Customer', 'Rider', 'Admin'];

const UsersTab = ({ search }) => {
  const { userInfo } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      await api.put(`/users/${id}/status`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success(`Role set to ${role}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const addRider = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/users/register', form);
      await api.put(`/users/${data._id}/role`, { role: 'Rider' });
      toast.success('Rider added');
      setAddOpen(false);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const q = search.toLowerCase();
  const rows = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const riderCount = users.filter((u) => u.role === 'Rider').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{users.length} users · {riderCount} riders</p>
        <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Rider
        </Button>
      </div>

      <AdminTable minWidth={680} columns={['User', 'Email', 'Role', 'Status', { label: 'Actions', className: 'text-right' }]}>
        {loading ? (
          <EmptyRow colSpan={5}>Loading…</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow colSpan={5}>No users found.</EmptyRow>
        ) : rows.map((u) => (
          <tr key={u._id} className="hover:bg-surface-2 transition-colors">
            <td className="p-4 text-fg font-medium">{u.name}</td>
            <td className="p-4 text-muted">
              <a href={`mailto:${u.email}`} className="hover:text-fg transition-colors">{u.email}</a>
            </td>
            <td className="p-4">
              {userInfo._id === u._id ? (
                <Badge variant="primary">{u.role}</Badge>
              ) : (
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                  className="bg-surface border border-line rounded-lg px-2 py-1 text-sm text-fg"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </td>
            <td className="p-4"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>{u.status}</Badge></td>
            <td className="p-4 text-right">
              {userInfo._id !== u._id && (
                <button
                  onClick={() => toggle(u._id)}
                  className={`p-2 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'}`}
                  title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      {addOpen && (
        <Modal
          title="Add a rider"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-rider-form" disabled={saving}>{saving ? 'Adding…' : 'Add rider'}</Button>
            </>
          }
        >
          <form id="add-rider-form" onSubmit={addRider} className="p-5 sm:p-6 space-y-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Temporary password" type="text" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="text-xs text-muted">The rider signs in with these and can change the password in Settings.</p>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersTab;
