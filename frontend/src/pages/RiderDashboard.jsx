import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Package, MapPin, User, Check, Truck, Bike } from 'lucide-react';
import { listRiderOrders, updateDelivery } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/formatter';
import Button from '../components/ui/Button';

const NEXT = {
  Assigned: { status: 'Picked Up', label: 'Mark picked up' },
  'Picked Up': { status: 'On the Way', label: 'Start delivery' },
  'On the Way': { status: 'Delivered', label: 'Mark delivered' },
};

const statusTone = (s) =>
  s === 'Delivered' ? 'bg-success/15 text-success'
  : s === 'On the Way' ? 'bg-primary/15 text-primary'
  : s === 'Picked Up' ? 'bg-accent/15 text-accent'
  : 'bg-surface-2 text-muted';

const RiderDashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.order);
  const { userInfo } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(listRiderOrders());
    const t = setInterval(() => dispatch(listRiderOrders()), 20000);
    return () => clearInterval(t);
  }, [dispatch]);

  const advance = async (order) => {
    const next = NEXT[order.delivery?.status];
    if (!next) return;
    if (next.status === 'Delivered' && !window.confirm('Confirm this order was delivered?')) return;
    const res = await dispatch(updateDelivery({ id: order._id, status: next.status }));
    if (updateDelivery.fulfilled.match(res)) toast.success(`Marked ${next.status}`);
    else toast.error(res.payload || 'Could not update');
  };

  const active = orders.filter((o) => o.delivery?.status !== 'Delivered');
  const done = orders.filter((o) => o.delivery?.status === 'Delivered');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-grow">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bike className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Deliveries</h1>
          <p className="text-sm text-muted">{userInfo?.name} · {active.length} active</p>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-muted text-sm py-16 text-center">Loading your deliveries…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-line rounded-2xl">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-fg font-semibold">No deliveries assigned</p>
          <p className="text-muted text-sm mt-1">New jobs will show up here automatically.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div className="space-y-4">
              {active.map((o) => {
                const next = NEXT[o.delivery?.status];
                return (
                  <div key={o._id} className="bg-surface border border-line rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted font-mono">#{o._id.slice(-8).toUpperCase()}</p>
                        <p className="text-fg font-semibold flex items-center gap-1.5 mt-1">
                          <User size={14} className="text-muted" /> {o.user?.name || 'Customer'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusTone(o.delivery?.status)}`}>
                        {o.delivery?.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted mb-3">
                      <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                      <span>
                        {o.shippingAddress?.streetName}, {o.shippingAddress?.district}, {o.shippingAddress?.city}
                        <br />
                        <span className="text-xs">Landmark: {o.shippingAddress?.landmark}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <p className="text-sm text-muted">
                        {o.orderItems.reduce((s, i) => s + i.qty, 0)} item(s) · {formatCurrency(o.totalPrice)}
                        <span className={o.isPaid ? 'text-success' : 'text-warning'}> · {o.isPaid ? 'Paid' : o.paymentMethod === 'Cash on Delivery' ? 'Collect cash' : 'Unpaid'}</span>
                      </p>
                      {next && (
                        <Button className="text-sm px-4 py-2 flex items-center gap-1.5" onClick={() => advance(o)}>
                          {next.status === 'Delivered' ? <Check size={15} /> : <Truck size={15} />} {next.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-muted mb-3">Delivered</h2>
              <div className="space-y-2">
                {done.slice(0, 10).map((o) => (
                  <div key={o._id} className="flex items-center justify-between bg-surface border border-line rounded-xl px-4 py-3 text-sm">
                    <span className="text-fg">{o.user?.name} · #{o._id.slice(-8).toUpperCase()}</span>
                    <span className="text-muted text-xs">
                      {o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
