import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchProductFilters } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import {
  SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, ChevronDown, Check,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const PRICE_RANGES = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under $500', min: '', max: '500' },
  { label: '$500 to $1,000', min: '500', max: '1000' },
  { label: 'Over $1,000', min: '1000', max: '' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, page, pages, filters } = useSelector((state) => state.products);

  const [panelOpen, setPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');

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

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== current.keyword) patch({ keyword: searchInput || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const activeFilterCount =
    (current.brand ? 1 : 0) +
    (current.minPrice || current.maxPrice ? 1 : 0) +
    (current.minRating ? 1 : 0) +
    (current.inStock ? 1 : 0);

  const hasActive = activeFilterCount > 0 || current.category || current.keyword;

  const activePriceLabel = PRICE_RANGES.find(
    (r) => String(r.min) === current.minPrice && String(r.max) === current.maxPrice
  )?.label;

  const categories = ['', ...(filters.categories || [])];
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === current.sort)?.label || 'Newest';

  return (
    <div className="min-h-screen bg-canvas w-full">
      {/* Header */}
      <div className="border-b border-line bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg tracking-tight">All Products</h1>
              <p className="text-muted text-xs sm:text-sm mt-1">Browse the full catalogue</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-canvas border border-line rounded-xl pl-9 pr-4 py-2.5 text-sm text-fg placeholder-muted/60 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = current.category === cat;
              return (
                <button
                  key={cat || 'all'}
                  onClick={() => patch({ category: cat || undefined })}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm shadow-primary/25'
                      : 'bg-canvas border border-line text-muted hover:text-fg hover:border-primary/40'
                  }`}
                >
                  {cat || 'All'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-line text-fg text-sm font-semibold hover:border-primary/40 transition-all"
          >
            <SlidersHorizontal size={15} className="text-primary" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-line text-fg text-sm font-medium hover:border-primary/40 transition-all"
            >
              <span className="text-muted hidden sm:inline">Sort:</span> {currentSortLabel}
              <ChevronDown size={15} className={`text-muted transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-surface border border-line rounded-xl shadow-xl z-40 overflow-hidden p-1">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { patch({ sort: o.value === 'newest' ? undefined : o.value }); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        current.sort === o.value ? 'bg-primary/10 text-primary font-semibold' : 'text-muted hover:text-fg hover:bg-surface-2'
                      }`}
                    >
                      {o.label}
                      {current.sort === o.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active chips */}
        {hasActive && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {current.keyword && <Chip label={`"${current.keyword}"`} onClear={() => { setSearchInput(''); patch({ keyword: undefined }); }} />}
            {current.category && <Chip label={current.category} onClear={() => patch({ category: undefined })} primary />}
            {current.brand && <Chip label={current.brand} onClear={() => patch({ brand: undefined })} />}
            {activePriceLabel && activePriceLabel !== 'Any price' && (
              <Chip label={activePriceLabel} onClear={() => patch({ minPrice: undefined, maxPrice: undefined })} />
            )}
            {current.minRating && <Chip label={`${current.minRating}★ & up`} onClear={() => patch({ minRating: undefined })} />}
            {current.inStock && <Chip label="In stock" onClear={() => patch({ inStock: undefined })} />}
            <button onClick={clearAll} className="text-xs font-semibold text-muted hover:text-danger transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="animate-shimmer h-60 sm:h-80 rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center">{error}</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-4">
              <Search size={22} className="text-muted" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-fg mb-2">No products found</h2>
            <p className="text-muted text-sm mb-5 max-w-xs">Try adjusting your filters or search.</p>
            <Button variant="secondary" onClick={clearAll} className="text-sm">Clear all filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <PageBtn disabled={page <= 1} onClick={() => patch({ page: Math.max(page - 1, 1) })}>
                  <ChevronLeft size={16} />
                </PageBtn>
                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                  .map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n - arr[idx - 1] > 1 && <span className="text-muted px-1">…</span>}
                      <PageBtn active={n === page} onClick={() => patch({ page: n })}>{n}</PageBtn>
                    </React.Fragment>
                  ))}
                <PageBtn disabled={page >= pages} onClick={() => patch({ page: Math.min(page + 1, pages) })}>
                  <ChevronRight size={16} />
                </PageBtn>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter slide-over */}
      <FilterPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        current={current}
        patch={patch}
        filters={filters}
        clearAll={clearAll}
      />
    </div>
  );
};

/* ── Sub-components ─────────────────────────────── */

const Chip = ({ label, onClear, primary }) => (
  <span className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold ${
    primary ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-surface-2 border border-line text-muted'
  }`}>
    {label}
    <button onClick={onClear}><X size={10} /></button>
  </span>
);

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
      active ? 'bg-primary text-on-primary shadow-sm shadow-primary/25' : 'bg-surface border border-line text-muted hover:text-fg hover:border-primary/40'
    }`}
  >
    {children}
  </button>
);

const PanelSection = ({ title, children }) => (
  <div className="py-5 border-b border-line">
    <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-3">{title}</p>
    {children}
  </div>
);

const FilterPanel = ({ open, onClose, current, patch, filters, clearAll }) => {
  const [brandSearch, setBrandSearch] = useState('');

  const brands = (filters.brands || []).filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-canvas border-l border-line z-[90] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h2 className="text-lg font-bold text-fg">Filters</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-muted hover:text-fg hover:bg-surface-2 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <PanelSection title="Price">
            <div className="flex flex-col gap-1">
              {PRICE_RANGES.map((r) => {
                const isActive = String(r.min) === current.minPrice && String(r.max) === current.maxPrice;
                return (
                  <button
                    key={r.label}
                    onClick={() => patch({ minPrice: r.min || undefined, maxPrice: r.max || undefined })}
                    className={`text-left px-3 py-2 rounded-xl text-[13px] transition-all ${
                      isActive ? 'bg-primary/10 text-primary font-semibold border border-primary/20' : 'text-muted hover:text-fg hover:bg-surface-2'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </PanelSection>

          {(filters.brands || []).length > 0 && (
            <PanelSection title="Brand">
              {(filters.brands || []).length > 6 && (
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brands…"
                    className="w-full bg-surface border border-line rounded-lg pl-8 pr-3 py-2 text-[13px] text-fg placeholder-muted/60 focus:outline-none focus:border-primary/50"
                  />
                </div>
              )}
              <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto scrollbar-hide">
                <FilterRow
                  label="All brands"
                  checked={!current.brand}
                  onClick={() => patch({ brand: undefined })}
                />
                {brands.map((b) => (
                  <FilterRow
                    key={b}
                    label={b}
                    checked={current.brand === b}
                    onClick={() => patch({ brand: current.brand === b ? undefined : b })}
                  />
                ))}
              </div>
            </PanelSection>
          )}

          <PanelSection title="Rating">
            <div className="flex flex-col gap-1">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => patch({ minRating: current.minRating === String(r) ? undefined : r })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-all ${
                    current.minRating === String(r) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-2 border border-transparent'
                  }`}
                >
                  <StarRating value={r} size={13} />
                  <span className="text-muted">& up</span>
                </button>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Availability">
            <FilterRow
              label="In stock only"
              checked={current.inStock}
              onClick={() => patch({ inStock: current.inStock ? undefined : 'true' })}
            />
          </PanelSection>
        </div>

        <div className="px-5 py-4 border-t border-line shrink-0 flex gap-3">
          <Button variant="secondary" className="flex-1 text-sm" onClick={clearAll}>Clear all</Button>
          <Button variant="primary" className="flex-1 text-sm font-semibold" onClick={onClose}>
            Show results
          </Button>
        </div>
      </aside>
    </>
  );
};

const FilterRow = ({ label, checked, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] text-muted hover:text-fg hover:bg-surface-2 transition-colors"
  >
    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
      checked ? 'bg-primary border-primary text-on-primary' : 'border-line'
    }`}>
      {checked && <Check size={12} />}
    </span>
    {label}
  </button>
);

export default ShopPage;
