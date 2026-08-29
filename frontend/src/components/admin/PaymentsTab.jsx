import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';

const Bar = ({ value, total, tone }) => (
  <div className="w-full bg-surface-2 h-1.5 rounded-full mt-4 overflow-hidden">
    <div className={`${tone} h-full rounded-full`} style={{ width: `${Math.min((value / (total || 1)) * 100, 100)}%` }} />
  </div>
);

const PaymentsTab = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/orders/summary').then((res) => setData(res.data)).catch(() => setData({}));
  }, []);

  if (!data) return <div className="flex justify-center py-20 text-muted">Calculating financials…</div>;

  const { totalSales = 0, numOrders = 0, evcSales = 0, codSales = 0, salesByDay = {} } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Total Paid Sales</p>
          <p className="text-3xl sm:text-4xl font-bold text-fg">{formatCurrency(totalSales)}</p>
          <p className="text-[10px] text-primary mt-2 font-bold uppercase tracking-wider">From {numOrders} orders</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">EVC Plus Sales</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(evcSales)}</p>
          <Bar value={evcSales} total={totalSales} tone="bg-primary" />
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-muted text-sm font-semibold mb-2">Cash on Delivery</p>
          <p className="text-2xl sm:text-3xl font-bold text-success">{formatCurrency(codSales)}</p>
          <Bar value={codSales} total={totalSales} tone="bg-success" />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-fg mb-6 tracking-tight">Sales History (Paid)</h3>
        <div className="space-y-3">
          {Object.keys(salesByDay).length === 0 ? (
            <p className="text-muted text-sm italic">No sales history yet.</p>
          ) : Object.entries(salesByDay).map(([date, amount]) => (
            <div key={date} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-line">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {date.split('/').slice(0, 2).join('/')}
                </div>
                <span className="text-muted font-bold text-sm">{date}</span>
              </div>
              <span className="text-fg font-bold">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
