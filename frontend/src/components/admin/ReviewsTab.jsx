import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Star, MessageSquare, Package } from 'lucide-react';
import api from '../../utils/api';
import StarRating from '../ui/StarRating';
import AdminTable, { EmptyRow } from './AdminTable';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-lg font-bold text-fg leading-none">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  </div>
);

const ReviewsTab = ({ search }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/products/reviews/all');
      setReviews(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (r) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/products/${r.productId}/reviews/${r._id}`);
      toast.success('Review removed');
      setReviews((list) => list.filter((x) => x._id !== r._id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const productsReviewed = new Set(reviews.map((r) => r.productId)).size;

  // Group by product for the "most reviewed" panel
  const topProducts = useMemo(() => {
    const map = new Map();
    for (const r of reviews) {
      const e = map.get(r.productId) || { id: r.productId, name: r.productName, count: 0, sum: 0 };
      e.count += 1;
      e.sum += r.rating;
      map.set(r.productId, e);
    }
    return [...map.values()]
      .map((e) => ({ ...e, avg: e.sum / e.count }))
      .sort((a, b) => b.count - a.count || b.avg - a.avg)
      .slice(0, 6);
  }, [reviews]);

  const q = search.toLowerCase();
  const rows = reviews.filter(
    (r) => r.name.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
  );

  const maxCount = topProducts[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat icon={MessageSquare} label="Total reviews" value={loading ? '…' : reviews.length} />
        <Stat icon={Star} label="Average rating" value={loading ? '…' : avg} />
        <Stat icon={Package} label="Products reviewed" value={loading ? '…' : productsReviewed} />
      </div>

      {/* Most reviewed products */}
      {!loading && topProducts.length > 0 && (
        <div className="bg-surface border border-line rounded-2xl p-5">
          <h3 className="text-sm font-bold text-fg mb-4">Most reviewed products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs text-muted w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <Link to={`/product/${p.id}`} className="text-sm text-fg font-medium truncate hover:text-primary">
                      {p.name}
                    </Link>
                    <span className="flex items-center gap-2 shrink-0 text-xs text-muted">
                      <StarRating value={p.avg} size={12} />
                      {p.count} review{p.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All reviews */}
      <div>
        <h3 className="text-sm font-bold text-fg mb-3">All reviews</h3>
        <AdminTable minWidth={760} columns={['Reviewer', 'Rating', 'Comment', 'Product', 'Date', { label: '', className: 'text-right' }]}>
          {loading ? (
            <EmptyRow colSpan={6}>Loading…</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={6}>No reviews yet.</EmptyRow>
          ) : rows.map((r) => (
            <tr key={r._id} className="hover:bg-surface-2 transition-colors align-top">
              <td className="p-4 text-fg font-medium whitespace-nowrap">{r.name}</td>
              <td className="p-4"><StarRating value={r.rating} size={13} /></td>
              <td className="p-4 text-muted max-w-xs"><p className="line-clamp-3">{r.comment}</p></td>
              <td className="p-4 whitespace-nowrap">
                <Link to={`/product/${r.productId}`} className="text-primary hover:underline text-sm">{r.productName}</Link>
              </td>
              <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="p-4 text-right">
                <button onClick={() => remove(r)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete review">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
};

export default ReviewsTab;
