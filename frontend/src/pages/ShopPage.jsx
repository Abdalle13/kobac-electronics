import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchProductFilters } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/ui/StarRating';
import {
  SlidersHorizontal, X, Search, ChevronLeft, ChevronRight,
  Smartphone, Laptop, Watch, Headphones, Tablet, Gamepad2, Package,
} from 'lucide-react';
import Button from '../components/ui/Button';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $500', min: '', max: '500' },
  { label: '$500 – $1,000', min: '500', max: '1000' },
  { label: 'Over $1,000', min: '1000', max: '' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

const categoryIcon = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('phone')) return Smartphone;
  if (c.includes('laptop')) return Laptop;
  if (c.includes('watch')) return Watch;
  if (c.includes('headphone')) return Headphones;
  if (c.includes('tablet')) return Tablet;
  if (c.includes('game') || c.includes('gaming')) return Gamepad2;
  return Package;
};

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, page, pages, total, filters } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');

  // Current filter values straight from the URL (URL is the single source of truth)
  const current = useMemo(() => ({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  // Merge a change into the URL; any filter change resets to page 1
  const patch = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === false) next.delete(key);
      else next.set(key, value);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    dispatch(fetchProductFilters());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(Object.fromEntries(searchParams)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, searchParams]);

  // Debounce the search box into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== current.keyword) {
        patch({ keyword: searchInput || undefined });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasActiveFilters =
    current.category || current.brand || current.minPrice || current.maxPrice ||
    current.minRating || current.inStock || current.keyword;

  const activePriceLabel = PRICE_RANGES.find(
    (r) => String(r.min) === current.minPrice && String(r.max) === current.maxPrice
  )?.label;

  const categories = ['', ...(filters.categories || [])];

  return (
    <div className="min-h-screen bg-[#0A0A0B] w-full">

      {/* Page Header */}
      <div className="border-b border-white/[0.06] bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">All Products</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search bar */}
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>

              {/* Sort */}
              <select
                value={current.sort}
                onChange={(e) => patch({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
                className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40 transition-all cursor-pointer shrink-0"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pill Row */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-4 sm:mt-5 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat ? categoryIcon(cat) : null;
              const isActive = current.category === cat;
              return (
                <button
                  key={cat || 'all'}
                  onClick={() => patch({ category: cat || undefined })}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  {cat || 'All'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 text-sm font-medium hover:bg-white/[0.08] transition-all"
          >
            <SlidersHorizontal size={14} className="text-primary" />
            {showFilters ? 'Hide Filters' : 'Filters'}
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`w-full md:w-52 lg:w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-primary" />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Filters</span>
              </div>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors font-medium">
                  Clear all
                </button>
              )}
            </div>

            {/* Price */}
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2">Price Range</p>
              <div className="flex flex-col gap-1">
                {PRICE_RANGES.map((range) => {
                  const isActive = String(range.min) === current.minPrice && String(range.max) === current.maxPrice;
                  return (
                    <button
                      key={range.label}
                      onClick={() => patch({ minPrice: range.min || undefined, maxPrice: range.max || undefined })}
                      className={`text-left px-3 py-2 rounded-xl text-[13px] transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            {filters.brands?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2">Brand</p>
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={() => patch({ brand: undefined })}
                    className={`text-left px-3 py-2 rounded-xl text-[13px] transition-all ${
                      !current.brand ? 'bg-primary/10 text-primary font-semibold border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    All Brands
                  </button>
                  {filters.brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => patch({ brand })}
                      className={`text-left px-3 py-2 rounded-xl text-[13px] transition-all ${
                        current.brand === brand ? 'bg-primary/10 text-primary font-semibold border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2">Rating</p>
              <div className="flex flex-col gap-1">
                {RATING_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => patch({ minRating: current.minRating === String(r) ? undefined : r })}
                    className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-[13px] transition-all ${
                      current.minRating === String(r)
                        ? 'bg-primary/10 font-semibold border border-primary/20'
                        : 'hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <StarRating value={r} size={12} />
                    <span className="text-gray-400">& up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <label className="flex items-center gap-2.5 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={current.inStock}
                onChange={(e) => patch({ inStock: e.target.checked ? 'true' : undefined })}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-[13px] text-gray-300">In stock only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-4 sm:mb-5 flex-wrap">
              {current.keyword && (
                <Chip label={`"${current.keyword}"`} onClear={() => { setSearchInput(''); patch({ keyword: undefined }); }} />
              )}
              {current.category && <Chip label={current.category} onClear={() => patch({ category: undefined })} primary />}
              {current.brand && <Chip label={current.brand} onClear={() => patch({ brand: undefined })} />}
              {activePriceLabel && activePriceLabel !== 'All Prices' && (
                <Chip label={activePriceLabel} onClear={() => patch({ minPrice: undefined, maxPrice: undefined })} />
              )}
              {current.minRating && <Chip label={`${current.minRating}★ & up`} onClear={() => patch({ minRating: undefined })} />}
              {current.inStock && <Chip label="In stock" onClear={() => patch({ inStock: undefined })} />}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-shimmer h-60 sm:h-80 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <Search size={22} className="text-gray-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2">No products found</h2>
              <p className="text-gray-500 text-sm mb-5 max-w-xs">Try adjusting your filters or searching for something else.</p>
              <Button variant="ghost" onClick={clearAll} className="text-sm border border-white/10">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    onClick={() => patch({ page: Math.max(page - 1, 1) })}
                    disabled={page <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: pages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                    .map((n, idx, arr) => (
                      <React.Fragment key={n}>
                        {idx > 0 && n - arr[idx - 1] > 1 && <span className="text-gray-600 px-1">…</span>}
                        <button
                          onClick={() => patch({ page: n })}
                          className={`min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                            n === page
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => patch({ page: Math.min(page + 1, pages) })}
                    disabled={page >= pages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Chip = ({ label, onClear, primary }) => (
  <span
    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold ${
      primary
        ? 'bg-primary/10 border border-primary/20 text-primary'
        : 'bg-white/[0.07] border border-white/[0.1] text-gray-300'
    }`}
  >
    {label}
    <button onClick={onClear}><X size={10} /></button>
  </span>
);

export default ShopPage;
