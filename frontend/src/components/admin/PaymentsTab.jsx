import React, { useEffect, useState } from 'react';
import { BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';

const Meter = ({ value, total, tone }) => (
  <div className="w-full bg-surface-2 h-1.5 rounded-full mt-4 overflow-hidden">
    <div className={`${tone} h-full rounded-full`} style={{ width: `${Math.min((value / (total || 1)) * 100, 100)}%` }} />
  </div>
);

const CAT_COLORS = ['var(--tk-primary)', 'var(--tk-success)', 'var(--tk-accent)', 'var(--tk-danger)', '#8b5cf6', '#06b6d4', '#f472b6'];

const PaymentsTab = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/orders/summary').then((res) => setData(res.data)).catch(() => setData({}));
  }, []);

  if (!data) return <div className="flex justify-center py-20 text-muted">Calculating financials…</div>;

  const {
    totalSales = 0, numOrders = 0, evcSales = 0, codSales = 0,
    goodsRevenue = 0, goodsCost = 0, grossProfit = 0, profitMargin = 0,
    salesByDay = {}, topProducts = [], salesByCategory = [],
  } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Total Paid Sales</p>
          <p className="text-3xl sm:text-4xl font-bold text-fg">{formatCurrency(totalSales)}</p>
          <p className="text-xs text-primary mt-2 font-semibold">From {numOrders} orders</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">EVC Plus Sales</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(evcSales)}</p>
          <Meter value={evcSales} total={totalSales} tone="bg-primary" />
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Cash on Delivery</p>
          <p className="text-2xl sm:text-3xl font-bold text-success">{formatCurrency(codSales)}</p>
          <Meter value={codSales} total={totalSales} tone="bg-success" />
        </div>
      </div>

      {/* Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Goods Revenue</p>
          <p className="text-2xl font-bold text-fg">{formatCurrency(goodsRevenue)}</p>
          <p className="text-xs text-muted mt-2">Items only, excludes tax and delivery</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Cost of Goods</p>
          <p className="text-2xl font-bold text-fg">{formatCurrency(goodsCost)}</p>
          <p className="text-xs text-muted mt-2">Supplier cost of what sold</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Gross Profit</p>
          <p className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(grossProfit)}</p>
          <p className="text-xs text-muted mt-2">{profitMargin.toFixed(1)}% margin</p>
        </div>
      </div>
      {goodsCost === 0 && goodsRevenue > 0 && (
        <p className="text-xs text-muted -mt-3">Set a cost price on your products to see real profit.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Sales by category */}
        <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-fg mb-4">Sales by Category</h3>
          {salesByCategory.length === 0 ? (
            <p className="text-muted text-sm">No paid sales yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategory} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={84} axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--tk-muted)', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'var(--tk-surface-2)' }}
                    contentStyle={{ background: 'var(--tk-surface)', border: '1px solid var(--tk-border)', borderRadius: 12, color: 'var(--tk-text)' }}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                  />
                  <RBar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={22}>
                    {salesByCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </RBar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-fg mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted text-sm">No paid sales yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {topProducts.map((p, i) => (
                <div key={p._id || i} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-muted text-xs w-4 shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-fg font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.units} sold
                        {p.cost > 0 && <span className="text-success"> · {formatCurrency(p.profit)} profit</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-fg font-semibold shrink-0 ml-3">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5 sm:p-8">
        <h3 className="text-lg font-bold text-fg mb-6 tracking-tight">Sales History (Paid)</h3>
        <div className="space-y-3">
          {Object.keys(salesByDay).length === 0 ? (
            <p className="text-muted text-sm italic">No sales history yet.</p>
          ) : Object.entries(salesByDay).map(([date, amount]) => (
            <div key={date} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-line">
              <span className="text-muted font-semibold text-sm">{date}</span>
              <span className="text-fg font-bold">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
