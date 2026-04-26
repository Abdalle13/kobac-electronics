import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { SlidersHorizontal, X, Smartphone, Laptop, Watch, Headphones, Tablet, Gamepad2, Package, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const CATEGORIES = [
  { label: 'All', value: '', icon: null },
  { label: 'Phones', value: 'Phone', icon: Smartphone },
  { label: 'Laptops', value: 'Laptop', icon: Laptop },
  { label: 'Wearables', value: 'Watch', icon: Watch },
  { label: 'Headphones', value: 'Headphones', icon: Headphones },
  { label: 'Tablets', value: 'Tablet', icon: Tablet },
  { label: 'Gaming', value: 'Gaming', icon: Gamepad2 },
  { label: 'Accessories', value: 'Accessories', icon: Package },
];

const PRICE_RANGES = [
  { label: 'All Prices', val: '' },
  { label: 'Under $500', val: '0-500' },
  { label: '$500 – $1,000', val: '500-1000' },
  { label: 'Over $1,000', val: '1000-99999' },
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, loading, error } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    if (category) setCategoryFilter(category);
    if (keyword) setSearchQuery(keyword);
    dispatch(fetchProducts(keyword));
  }, [dispatch, location.search]);

  const filteredProducts = products.filter((product) => {
    if (categoryFilter && product.category !== categoryFilter) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number);
      if (max && (product.price < min || product.price > max)) return false;
      if (!max && product.price < min) return false;
    }
    return true;
  });

  const hasActiveFilters = categoryFilter || priceFilter || searchQuery;

  const clearAll = () => {
    setCategoryFilter('');
    setPriceFilter('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] w-full">

      {/* Page Header */}
      <div className="border-b border-white/[0.06] bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">All Products</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {loading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            {/* Search bar */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Category Pill Row */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-4 sm:mt-5 scrollbar-hide">
            {CATEGORIES.map(({ label, value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                  categoryFilter === value
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {Icon && <Icon size={12} />}
                {label}
              </button>
            ))}
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
            {showFilters ? 'Hide Filters' : 'Price Filter'}
            {priceFilter && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`w-full md:w-48 lg:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 sm:p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
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

            <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2 sm:mb-3">Price Range</p>
            <div className="flex flex-col gap-1">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.val}
                  onClick={() => setPriceFilter(range.val)}
                  className={`text-left px-3 py-2 rounded-xl text-[12px] sm:text-[13px] transition-all ${
                    priceFilter === range.val
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-4 sm:mb-5 flex-wrap">
              {categoryFilter && (
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-[12px] font-semibold">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('')}><X size={10} /></button>
                </span>
              )}
              {priceFilter && (
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.1] text-gray-300 text-[11px] sm:text-[12px] font-semibold">
                  {PRICE_RANGES.find(r => r.val === priceFilter)?.label}
                  <button onClick={() => setPriceFilter('')}><X size={10} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.1] text-gray-300 text-[11px] sm:text-[12px] font-semibold">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-shimmer h-60 sm:h-80 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <Search size={20} className="text-gray-600 sm:hidden" />
                <Search size={24} className="text-gray-600 hidden sm:block" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2">No products found</h2>
              <p className="text-gray-500 text-sm mb-5 max-w-xs">Try adjusting your filters or searching for something else.</p>
              <Button variant="ghost" onClick={clearAll} className="text-sm border border-white/10">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
