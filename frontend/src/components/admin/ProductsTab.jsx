import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { fetchProducts } from '../../redux/slices/productSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AdminTable, { EmptyRow } from './AdminTable';
import ProductModal from './ProductModal';

const Summary = ({ label, value, tone = 'text-fg' }) => (
  <div className="bg-surface border border-line rounded-2xl p-4">
    <p className="text-xs text-muted">{label}</p>
    <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
  </div>
);

const ProductsTab = ({ search }) => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.products);
  const [modal, setModal] = useState(null); // null | 'new' | product
  const [category, setCategory] = useState('All');

  const stats = useMemo(() => {
    const byCat = {};
    let stockUnits = 0;
    let outOfStock = 0;
    let lowStock = 0;
    for (const p of products) {
      byCat[p.category] = (byCat[p.category] || 0) + 1;
      stockUnits += p.countInStock;
      if (p.countInStock === 0) outOfStock += 1;
      else if (p.countInStock <= 5) lowStock += 1;
    }
    const categories = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    return { byCat, categories, stockUnits, outOfStock, lowStock };
  }, [products]);

  const q = search.toLowerCase();
  const rows = products.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  );

  const remove = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      dispatch(fetchProducts({ limit: 1000 }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Summary label="Total products" value={loading ? '…' : products.length} />
        <Summary label="Units in stock" value={loading ? '…' : stats.stockUnits} />
        <Summary label="Low stock" value={loading ? '…' : stats.lowStock} tone={stats.lowStock ? 'text-warning' : 'text-fg'} />
        <Summary label="Out of stock" value={loading ? '…' : stats.outOfStock} tone={stats.outOfStock ? 'text-danger' : 'text-fg'} />
      </div>

      {/* Category breakdown / filter */}
      <div className="bg-surface border border-line rounded-2xl p-4">
        <p className="text-xs text-muted mb-3">By category (tap to filter)</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted hover:text-fg'
            }`}
          >
            All {products.length}
          </button>
          {stats.categories.map(([cat, n]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? 'All' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === cat ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted hover:text-fg'
              }`}
            >
              {cat} <span className={category === cat ? 'opacity-80' : 'text-fg'}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? '' : `${rows.length} shown${category !== 'All' ? ` in ${category}` : ''}`}
        </p>
        <Button onClick={() => setModal('new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <AdminTable columns={['Product', 'Price', 'Category', { label: 'Stock', className: 'hidden lg:table-cell' }, { label: 'Actions', className: 'text-right' }]}>
        {loading ? (
          <EmptyRow colSpan={5}>Loading…</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow colSpan={5}>No products found.</EmptyRow>
        ) : rows.map((p) => (
          <tr key={p._id} className="hover:bg-surface-2 transition-colors">
            <td className="p-4">
              <div className="flex items-center gap-3">
                <img src={p.images[0] || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 rounded-lg border border-line object-cover" />
                <div>
                  <p className="text-fg font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted">{p._id.slice(0, 8)}…</p>
                </div>
              </div>
            </td>
            <td className="p-4 text-fg">{formatCurrency(p.price)}</td>
            <td className="p-4"><Badge variant="neutral">{p.category}</Badge></td>
            <td className="p-4 hidden lg:table-cell">
              <span className={p.countInStock > 0 ? 'text-success font-semibold' : 'text-danger font-semibold'}>{p.countInStock}</span>
            </td>
            <td className="p-4 text-right whitespace-nowrap">
              <button onClick={() => setModal(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => remove(p._id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default ProductsTab;
