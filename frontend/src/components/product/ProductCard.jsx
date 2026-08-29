import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart, toggleCart } from '../../redux/slices/cartSlice';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import WishlistButton from './WishlistButton';
import { formatCurrency } from '../../utils/formatter';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ ...product, qty: 1 }));
    dispatch(toggleCart());
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-surface border border-line rounded-xl overflow-hidden hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 right-2">
          {product.countInStock > 0 ? (
            <Badge variant="success" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">In Stock</Badge>
          ) : (
            <Badge variant="danger" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">Out of Stock</Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="neutral" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">{product.category}</Badge>
        </div>
        <div className="absolute bottom-2 right-2">
          <WishlistButton product={product} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-fg mb-0.5 truncate">{product.name}</h3>
        <p className="text-xs text-muted mb-2 truncate">{product.brand}</p>

        <div className="mb-3 h-4">
          {product.numReviews > 0 && (
            <StarRating value={product.rating} size={13} count={product.numReviews} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-xl font-bold text-fg">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
