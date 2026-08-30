import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import { listOrders } from '../../redux/slices/orderSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';

const LOW_STOCK = 5;

const statusTone = (s) =>
  s === 'Delivered' ? 'text-success' : s === 'Cancelled' ? 'text-danger' : s === 'Paid' ? 'text-primary' : 'text-muted';

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-xl border ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-muted font-semibold tracking-wider text-[10px] uppercase">{label}</h3>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-fg">{value}</p>
  </div>
);

const OverviewTab = () => {
  const dispatch = useDispatch();
  const { products, loading: productsLoading } = useSelector((s) => s.products);
  const { orders, loading: ordersLoading } = useSelector((s) => s.order);
  const [stats, setStats] = useState({ totalUsers: 0, salesByDay: [], loading: true });
  const [range, setRange] = useState(7);

  useEffect(() => {
    dispatch(listOrders());
    dispatch(fetchProducts({ limit: 1000 }));

    (async () => {
      try {
        const [usersRes, summaryRes] = await Promise.all([
          api.get('/users'),
          api.get('/orders/summary'),
        ]);
        const salesByDay = Object.entries(summaryRes.data.salesByDay || {})
          .map(([date, amount]) => ({ date: date.split('/').slice(0, 2).join('/'), amount }));
        setStats({ totalUsers: usersRes.data.length, salesByDay, loading: false });
      } catch {
        setStats((p) => ({ ...p, loading: false }));
      }
    })();
  }, [dispatch]);

  const revenue = orders.filter((o) => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
  const chartData = stats.salesByDay.slice(-range);
  const lowStock = products.filter((p) => p.countInStock <= LOW_STOCK).sort((a, b) => a.countInStock - b.countInStock);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (stats.loading || ordersLoading || productsLoading) {
    return <div className="flex justify-center py-20 text-muted">Loading metrics…</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(revenue)} tone="bg-primary/10 text-primary border-primary/20" />
        <StatCard icon={ShoppingBag} label="Orders" value={orders.length} tone="bg-success/10 text-success border-success/20" />
        <StatCard icon={Users} label="Active Users" value={stats.totalUsers} tone="bg-accent/10 text-accent border-accent/20" />
        <StatCard icon={Package} label="Products" value={products.length} tone="bg-primary/10 text-primary border-primary/20" />
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-fg tracking-tight">Revenue</h3>
            <p className="text-xs text-muted mt-1">Paid orders by day</p>
          </div>
          <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
            {[7, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  range === r ? 'bg-primary text-on-primary' : 'text-muted hover:text-fg'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        <div className="h-[240px] sm:h-[340px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted text-sm">No paid sales in this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--tk-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--tk-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tk-border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--tk-muted)', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--tk-muted)', fontSize: 9, fontWeight: 700 }} width={40}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--tk-surface)', border: '1px solid var(--tk-border)', borderRadius: 12, color: 'var(--tk-text)' }}
                  formatter={(v) => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--tk-primary)" strokeWidth={2.5} fill="url(#rev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent orders */}
        <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-fg mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No orders yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="text-fg font-medium truncate">{o.user?.name || 'Guest'}</p>
                    <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-fg font-semibold">{formatCurrency(o.totalPrice)}</p>
                    <p className={`text-xs font-medium ${statusTone(o.status)}`}>{o.status || 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className={lowStock.length ? 'text-warning' : 'text-muted'} />
            <h3 className="text-base font-bold text-fg">Low Stock</h3>
            {lowStock.length > 0 && (
              <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">{lowStock.length}</span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-muted text-sm">All products are well stocked.</p>
          ) : (
            <div className="divide-y divide-line max-h-64 overflow-y-auto scrollbar-hide">
              {lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-fg truncate mr-3">{p.name}</span>
                  <span className={`font-bold shrink-0 ${p.countInStock === 0 ? 'text-danger' : 'text-warning'}`}>
                    {p.countInStock === 0 ? 'Out of stock' : `${p.countInStock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
