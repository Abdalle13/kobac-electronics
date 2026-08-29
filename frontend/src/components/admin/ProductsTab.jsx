import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { fetchProducts } from '../../redux/slices/productSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AdminTable, { EmptyRow } from './AdminTable';
import ProductModal from './ProductModal';

const ProductsTab = ({ search }) => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.products);
  const [modal, setModal] = useState(null); // null | 'new' | product

  const q = search.toLowerCase();
  const rows = products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));

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

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/products/${id}/status`);
      toast.success(data.message || 'Status updated');
      dispatch(fetchProducts({ limit: 1000 }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setModal('new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <AdminTable columns={['Product', 'Price', 'Category', { label: 'Stock', className: 'hidden lg:table-cell' }, 'Status', { label: 'Actions', className: 'text-right' }]}>
        {loading ? (
          <EmptyRow colSpan={6}>Loading…</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow colSpan={6}>No products found.</EmptyRow>
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
            <td className="p-4">
              <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status || 'Active'}</Badge>
            </td>
            <td className="p-4 text-right whitespace-nowrap">
              <button onClick={() => setModal(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => toggleStatus(p._id)} className="p-2 text-muted hover:bg-surface-2 hover:text-fg rounded-lg transition-colors" title={p.status === 'Active' ? 'Archive' : 'Restore'}>
                {p.status === 'Active' ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
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
