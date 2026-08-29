import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';

/**
 * Heart toggle for adding/removing a product from the wishlist.
 * `variant="icon"` = floating circular button (product cards).
 * `variant="inline"` = labelled button (product detail page).
 */
const WishlistButton = ({ product, variant = 'icon', className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.wishlist);

  const inWishlist = items.some((p) => p._id === product._id);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      toast.error('Sign in to save items to your wishlist');
      navigate('/login');
      return;
    }

    if (inWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Saved to wishlist');
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center justify-center gap-2 px-4 h-[46px] rounded-md border transition-all ${
          inWishlist
            ? 'border-danger/40 bg-danger/10 text-danger'
            : 'border-line bg-surface text-muted hover:text-fg hover:border-primary/40'
        } ${className}`}
      >
        <Heart size={18} className={inWishlist ? 'fill-danger' : ''} />
        <span className="text-sm font-medium">{inWishlist ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
        inWishlist
          ? 'bg-danger text-white'
          : 'bg-black/40 text-white hover:bg-black/60'
      } ${className}`}
    >
      <Heart size={15} className={inWishlist ? 'fill-white' : ''} />
    </button>
  );
};

export default WishlistButton;
