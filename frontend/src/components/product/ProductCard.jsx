import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart, toggleCart } from '../../redux/slices/cartSlice';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

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
      className="group block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#111]">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 right-2 sm:top-2 sm:right-2">
          {product.countInStock > 0 ? (
            <Badge variant="success" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">In Stock</Badge>
          ) : (
            <Badge variant="danger" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">Out of Stock</Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="neutral" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">{product.category}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-white mb-0.5 truncate">{product.name}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 truncate">{product.brand}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-xl font-bold text-white">
            ${product.price.toLocaleString('en-US')}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
