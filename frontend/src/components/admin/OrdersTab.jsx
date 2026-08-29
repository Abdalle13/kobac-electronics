import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { XCircle } from 'lucide-react';
import { listOrders, deliverOrder, payOrderAdmin } from '../../redux/slices/orderSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AdminTable, { EmptyRow } from './AdminTable';
import OrderDetailsModal from './OrderDetailsModal';

const statusVariant = (s) => (s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Paid' ? 'primary' : 'neutral');

const OrdersTab = ({ search }) => {
  const dispatch = useDispatch();
  const { orders } = useSelector((s) => s.order);
  const [selected, setSelected] = useState(null);

  useEffect(() => { dispatch(listOrders()); }, [dispatch]);

  const q = search.toLowerCase();
  const rows = orders.filter((o) => o._id.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q));

  const act = async (fn, id, msg) => {
    const res = await dispatch(fn(id));
    if (fn.fulfilled.match(res)) {
      toast.success(msg);
      dispatch(listOrders());
    } else {
      toast.error(res.payload || 'Action failed');
    }
  };

  const markPaid = (id) => act(payOrderAdmin, id, 'Marked as paid');
  const markDelivered = (id) => {
    if (window.confirm('Mark this order as delivered?')) act(deliverOrder, id, 'Marked as delivered');
  };
  const cancel = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      dispatch(listOrders());
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <AdminTable minWidth={820} columns={['Order', 'Customer', 'Total', 'Status', { label: 'Actions', className: 'text-right' }]}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={5}>No orders found.</EmptyRow>
        ) : rows.map((o) => (
          <tr key={o._id} className="hover:bg-surface-2 transition-colors">
            <td className="p-4 text-xs text-muted">{o._id.slice(0, 12)}…</td>
            <td className="p-4 text-fg">{o.user?.name || 'Guest'}</td>
            <td className="p-4 text-fg">{formatCurrency(o.totalPrice)}</td>
            <td className="p-4"><Badge variant={statusVariant(o.status)}>{o.status || (o.isDelivered ? 'Delivered' : 'Pending')}</Badge></td>
            <td className="p-4 text-right whitespace-nowrap space-x-1.5">
              {!o.isPaid && o.status !== 'Cancelled' && (
                <Button size="sm" className="text-xs px-3 py-1.5" onClick={() => markPaid(o._id)}>Mark Paid</Button>
              )}
              {!o.isDelivered && o.status !== 'Cancelled' && (
                <Button size="sm" variant="secondary" className="text-xs px-3 py-1.5" onClick={() => markDelivered(o._id)}>Deliver</Button>
              )}
              <Button size="sm" variant="ghost" className="text-xs px-3 py-1.5" onClick={() => setSelected(o)}>Details</Button>
              {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                <button onClick={() => cancel(o._id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors align-middle" title="Cancel">
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      {selected && <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default OrdersTab;
