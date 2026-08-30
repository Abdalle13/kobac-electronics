import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api from '../../utils/api';
import StarRating from '../ui/StarRating';
import AdminTable, { EmptyRow } from './AdminTable';

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

  const q = search.toLowerCase();
  const rows = reviews.filter(
    (r) => r.name.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
  );

  return (
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
  );
};

export default ReviewsTab;
