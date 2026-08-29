import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, Activity } from 'lucide-react';
import { listOrders } from '../../redux/slices/orderSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';

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
  const [stats, setStats] = useState({ totalUsers: 0, monthlySales: [], loading: true });

  useEffect(() => {
    dispatch(listOrders());
    dispatch(fetchProducts({ limit: 1000 }));

    (async () => {
      try {
        const [usersRes, summaryRes] = await Promise.all([
          api.get('/users'),
          api.get('/orders/summary'),
        ]);
        const chartData = Object.entries(summaryRes.data.salesByDay || {})
          .map(([date, amount]) => ({ date: date.split('/').slice(0, 2).join('/'), amount }))
          .slice(-7);
        setStats({ totalUsers: usersRes.data.length, monthlySales: chartData, loading: false });
      } catch {
        setStats((p) => ({ ...p, loading: false }));
      }
    })();
  }, [dispatch]);

  const revenue = orders.filter((o) => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
  const chartData = stats.monthlySales.length > 0 ? stats.monthlySales : [];

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
            <h3 className="text-lg sm:text-xl font-bold text-fg tracking-tight">Revenue (last 7 days)</h3>
            <p className="text-xs text-muted mt-1">Paid orders by day</p>
          </div>
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
            <Activity size={14} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">Live</span>
          </div>
        </div>

        <div className="h-[240px] sm:h-[340px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted text-sm">No paid sales in the last 7 days.</div>
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
    </div>
  );
};

export default OverviewTab;
