import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (!isAdmin) dispatch(fetchWishlist());
  }, [dispatch, isAdmin]);

  if (isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-grow">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-danger fill-danger" />
        <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">My Favorites</h1>
        {items.length > 0 && (
          <span className="text-sm text-muted">({items.length})</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-shimmer h-60 sm:h-80 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-line flex items-center justify-center mb-5">
            <Heart size={26} className="text-muted" />
          </div>
          <h2 className="text-lg font-bold text-fg mb-2">No favorites yet</h2>
          <p className="text-muted text-sm mb-6 max-w-xs">
            Tap the heart on any product to save it here for later.
          </p>
          <Link to="/shop">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
