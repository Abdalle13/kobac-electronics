import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';
import { downloadSalesReport } from '../../utils/salesReportPdf';
import Button from '../ui/Button';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-line last:border-0 text-sm">
    <span className="text-muted">{label}</span>
    <span className="text-fg font-semibold">{value}</span>
  </div>
);

const KPI = ({ label, value, sub }) => (
  <div className="border border-line rounded-xl p-4">
    <p className="text-xs text-muted font-semibold uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-fg mt-1">{value}</p>
    {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
  </div>
);

const ReportTab = () => {
  const { storeName } = useSelector((s) => s.settings);
  const [data, setData] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/orders/summary'), api.get('/users')])
      .then(([s, u]) => { setData(s.data); setUserCount(u.data.length); })
      .catch(() => setData({}));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadSalesReport({ storeName, userCount, data });
    } catch {
      toast.error('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!data) return <div className="flex justify-center py-20 text-muted">Building report…</div>;

  const {
    totalSales = 0, numOrders = 0, numPaidOrders = 0, avgOrderValue = 0,
    evcSales = 0, codSales = 0, goodsRevenue = 0, goodsCost = 0, grossProfit = 0, profitMargin = 0,
    statusBreakdown = {}, topProducts = [], salesByCategory = [],
  } = data;

  const generated = new Date().toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Live preview of the sales report.</p>
        <Button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> {downloading ? 'Preparing…' : 'Download PDF'}
        </Button>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <p className="text-lg font-bold text-fg">{storeName || 'Kobac Electronics'}</p>
            <p className="text-sm text-muted">Sales Report</p>
          </div>
          <p className="text-xs text-muted text-right">Generated<br />{generated}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPI label="Total Sales" value={formatCurrency(totalSales)} sub={`${numPaidOrders} paid orders`} />
          <KPI label="All Orders" value={numOrders} />
          <KPI label="Avg Order Value" value={formatCurrency(avgOrderValue)} />
          <KPI label="Customers" value={userCount} />
        </div>

        {/* Payment split */}
        <div>
          <h3 className="text-sm font-bold text-fg mb-2">Revenue by payment method</h3>
          <Row label="EVC Plus" value={formatCurrency(evcSales)} />
          <Row label="Cash on Delivery" value={formatCurrency(codSales)} />
        </div>

        {/* Profitability */}
        <div>
          <h3 className="text-sm font-bold text-fg mb-2">Profitability</h3>
          <Row label="Goods revenue" value={formatCurrency(goodsRevenue)} />
          <Row label="Cost of goods" value={formatCurrency(goodsCost)} />
          <Row label="Gross profit" value={`${formatCurrency(grossProfit)} (${profitMargin.toFixed(1)}%)`} />
        </div>

        {/* Status breakdown */}
        <div>
          <h3 className="text-sm font-bold text-fg mb-2">Orders by status</h3>
          {Object.keys(statusBreakdown).length === 0 ? (
            <p className="text-sm text-muted">No orders.</p>
          ) : Object.entries(statusBreakdown).map(([s, n]) => <Row key={s} label={s} value={n} />)}
        </div>

        {/* Top products */}
        <div>
          <h3 className="text-sm font-bold text-fg mb-2">Top products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted">No paid sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase border-b border-line">
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-right py-2 font-medium">Units</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p._id || i} className="border-b border-line last:border-0">
                    <td className="py-2 text-fg">{p.name}</td>
                    <td className="py-2 text-right text-muted">{p.units}</td>
                    <td className="py-2 text-right text-fg font-medium">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Category */}
        <div>
          <h3 className="text-sm font-bold text-fg mb-2">Sales by category</h3>
          {salesByCategory.length === 0 ? (
            <p className="text-sm text-muted">No paid sales yet.</p>
          ) : salesByCategory.map((c) => <Row key={c.category} label={`${c.category} (${c.units} units)`} value={formatCurrency(c.revenue)} />)}
        </div>

        <p className="text-[10px] text-muted text-center pt-4 border-t border-line">
          {storeName || 'Kobac Electronics'} · confidential
        </p>
      </div>
    </div>
  );
};

export default ReportTab;
