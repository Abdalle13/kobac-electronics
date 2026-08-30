// Lazy-loaded so jspdf never touches the storefront bundle.
import { formatCurrency } from './formatter';

const PRIMARY = [37, 99, 235]; // #2563EB
const MUTED = [107, 114, 128];

export async function downloadSalesReport({ storeName, userCount, data }) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableMod.default;

  const {
    totalSales = 0, numOrders = 0, numPaidOrders = 0, avgOrderValue = 0,
    evcSales = 0, codSales = 0, statusBreakdown = {}, topProducts = [], salesByCategory = [],
  } = data;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 48;
  const generated = new Date().toLocaleString();

  // Header
  doc.setFontSize(18).setFont(undefined, 'bold').setTextColor(17, 24, 39);
  doc.text(storeName || 'Kobac Electronics', M, 60);
  doc.setFontSize(11).setFont(undefined, 'normal').setTextColor(...MUTED);
  doc.text('Sales Report', M, 78);
  doc.text(`Generated ${generated}`, pageW - M, 60, { align: 'right' });
  doc.setDrawColor(...PRIMARY).setLineWidth(1.5).line(M, 92, pageW - M, 92);

  // KPI grid
  const kpis = [
    ['Total Sales', formatCurrency(totalSales), `${numPaidOrders} paid orders`],
    ['All Orders', String(numOrders), ''],
    ['Avg Order Value', formatCurrency(avgOrderValue), ''],
    ['Customers', String(userCount), ''],
  ];
  let y = 118;
  const colW = (pageW - M * 2) / 2;
  kpis.forEach((k, i) => {
    const x = M + (i % 2) * colW;
    if (i % 2 === 0 && i > 0) y += 62;
    doc.setDrawColor(209, 213, 219).setLineWidth(0.7).roundedRect(x, y - 14, colW - 12, 52, 5, 5);
    doc.setFontSize(8).setTextColor(...MUTED).text(k[0].toUpperCase(), x + 12, y);
    doc.setFontSize(15).setFont(undefined, 'bold').setTextColor(17, 24, 39).text(k[1], x + 12, y + 18);
    if (k[2]) { doc.setFontSize(8).setFont(undefined, 'normal').setTextColor(...MUTED).text(k[2], x + 12, y + 30); }
  });
  y += 70;

  const table = (title, head, body) => {
    doc.setFontSize(11).setFont(undefined, 'bold').setTextColor(17, 24, 39).text(title, M, y);
    autoTable(doc, {
      startY: y + 8,
      head: [head],
      body: body.length ? body : [['No data', ...head.slice(1).map(() => '')]],
      margin: { left: M, right: M },
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
    });
    y = doc.lastAutoTable.finalY + 26;
  };

  table('Revenue by payment method', ['Method', 'Revenue'], [
    ['EVC Plus', formatCurrency(evcSales)],
    ['Cash on Delivery', formatCurrency(codSales)],
  ]);

  table('Orders by status', ['Status', 'Count'],
    Object.entries(statusBreakdown).map(([s, n]) => [s, String(n)]));

  table('Top products', ['Product', 'Units', 'Revenue'],
    topProducts.map((p) => [p.name, String(p.units), formatCurrency(p.revenue)]));

  table('Sales by category', ['Category', 'Units', 'Revenue'],
    salesByCategory.map((c) => [c.category, String(c.units), formatCurrency(c.revenue)]));

  doc.setFontSize(8).setTextColor(...MUTED)
    .text(`${storeName || 'Kobac Electronics'} - confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 24, { align: 'center' });

  doc.save(`sales-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
