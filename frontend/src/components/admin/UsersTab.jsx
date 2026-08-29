import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Power } from 'lucide-react';
import api from '../../utils/api';
import Badge from '../ui/Badge';
import AdminTable, { EmptyRow } from './AdminTable';

const UsersTab = ({ search }) => {
  const { userInfo } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const q = search.toLowerCase();
  const rows = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  return (
    <AdminTable minWidth={620} columns={['User', 'Email', 'Role', 'Status', { label: 'Actions', className: 'text-right' }]}>
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
          <td className="p-4"><Badge variant={u.role === 'Admin' ? 'primary' : 'neutral'}>{u.role}</Badge></td>
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
  );
};

export default UsersTab;
