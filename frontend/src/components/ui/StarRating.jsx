import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating
 * - Display mode (default): shows `value` out of 5, supports half-ish via fill.
 * - Interactive mode: pass `onChange` to let the user pick a rating.
 */
const StarRating = ({ value = 0, onChange, size = 16, className = '', showValue = false, count }) => {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const active = hover || value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(active);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={interactive ? () => onChange(star) : undefined}
              onMouseEnter={interactive ? () => setHover(star) : undefined}
              onMouseLeave={interactive ? () => setHover(0) : undefined}
              className={interactive ? 'cursor-pointer p-0.5 transition-transform hover:scale-110' : 'cursor-default'}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
              />
            </button>
          );
        })}
      </div>
      {showValue && value > 0 && (
        <span className="text-xs font-semibold text-gray-300">{Number(value).toFixed(1)}</span>
      )}
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
