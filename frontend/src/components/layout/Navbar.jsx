import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, Search, Menu, LogOut,
  Package, ShieldCheck, Zap, X, Mail, Home, Store, Info, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CartDrawer from './CartDrawer';
import { logout } from '../../redux/slices/authSlice';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { freeShippingThreshold } = useSelector((state) => state.settings);

  const handleLogout = () => {
    dispatch(logout());
    setIsDrawerOpen(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/shop?keyword=${keyword}` : '/shop');
    setIsDrawerOpen(false);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const NAV_LINKS = [
    { to: '/', icon: Home, label: 'HOME' },
    { to: '/about', icon: Info, label: 'ABOUT' },
    { to: '/shop', icon: Store, label: 'SHOP' },
    { to: '/contact', icon: Mail, label: 'SUPPORT' },
    ...(userInfo ? [
      { to: '/wishlist', icon: Heart, label: 'WISHLIST' },
      { to: '/my-orders', icon: Package, label: 'ORDERS' },
    ] : []),
    ...(userInfo?.role?.toLowerCase() === 'admin' ? [{ to: '/dashboard', icon: ShieldCheck, label: 'DASHBOARD', highlight: true }] : []),
  ];

  return (
    <>
      {/* Promo Bar */}
      <div className="bg-primary text-on-primary text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 text-center tracking-wide">
        <span className="flex items-center justify-center gap-2 px-4">
          <Zap size={12} className="animate-pulse shrink-0" />
          <span>Spend ${freeShippingThreshold}+ and Get FREE Delivery — Limited Time Offer</span>
        </span>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 w-full z-[60] glass border-b border-line h-16 sm:h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="text-base sm:text-xl md:text-2xl font-black tracking-tighter text-fg shrink-0">
            KOBAC <span className="text-primary">Electronics</span>
          </Link>

          {/* Center Nav — desktop only */}
          <div className="hidden lg:flex items-center space-x-10 text-[12px] font-bold uppercase tracking-[0.2em] text-muted">
            {userInfo?.role?.toLowerCase() === 'admin' ? (
              <Link to="/dashboard" className="text-primary hover:text-primary-hover transition-colors font-black tracking-[0.3em]">ADMIN DASHBOARD</Link>
            ) : (
              <>
                <Link to="/" className="hover:text-fg transition-colors">Home</Link>
                <Link to="/about" className="hover:text-fg transition-colors">About</Link>
                <Link to="/shop" className="hover:text-fg transition-colors">Shop</Link>
                <Link to="/contact" className="hover:text-fg transition-colors">Support</Link>
                {userInfo && <Link to="/my-orders" className="hover:text-fg transition-colors">Orders</Link>}
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

            {/* Desktop Search */}
            <div className="hidden lg:block relative group">
              <form onSubmit={handleSearch}>
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-surface border border-line rounded-full py-2 pl-9 pr-4 text-[11px] text-fg focus:outline-none focus:border-primary/50 w-32 focus:w-48 transition-all duration-300"
                />
              </form>
            </div>

            {/* Desktop Sign In / Sign Up — only if not logged in */}
            {!userInfo && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-[11px] font-bold tracking-widest uppercase px-4">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-[11px] font-black tracking-widest px-5 py-2 rounded-full shadow-lg shadow-primary/20">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggle className="hidden sm:flex" />

            {/* Wishlist */}
            {userInfo && (
              <Link
                to="/wishlist"
                className="relative text-muted hover:text-fg transition-colors p-1.5 sm:p-2 hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 sm:top-0.5 sm:right-0.5 bg-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-on-primary ring-2 ring-canvas">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-muted hover:text-fg transition-colors p-1.5 sm:p-2"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} className="sm:hidden" />
              <ShoppingCart size={22} className="hidden sm:block" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 sm:top-0.5 sm:right-0.5 bg-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-on-primary ring-2 ring-canvas">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </button>

            {/* ── Mobile: Avatar OR Hamburger — BOTH open the same drawer ── */}

            {/* Desktop: profile pill trigger (lg+ only) */}
            {userInfo && (
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-surface border border-line rounded-full pl-1.5 pr-3 py-1.5 hover:bg-surface-2 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-on-primary uppercase overflow-hidden ring-2 ring-primary/20">
                    {userInfo.image ? (
                      <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      userInfo.name.charAt(0)
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-muted max-w-[80px] truncate">{userInfo.name.split(' ')[0]}</span>
                </button>

                {/* Desktop Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-surface border border-line rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-line bg-surface-2">
                          <p className="text-sm font-bold text-fg truncate">{userInfo.name}</p>
                          <p className="text-xs text-muted truncate mt-0.5">{userInfo.email}</p>
                        </div>
                        <div className="p-1.5 flex flex-col">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-surface-2 transition-all"
                          >
                            <User size={14} className="text-primary" /> Profile
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-surface-2 transition-all"
                          >
                            <Package size={14} className="text-primary" /> Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-danger hover:bg-danger/10 transition-all w-full text-left"
                          >
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hamburger — mobile only, single trigger for everything */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden text-muted hover:text-fg transition-colors p-1.5"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          FULL-SCREEN TOP-DOWN MENU OVERLAY
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-canvas/98 backdrop-blur-xl flex flex-col lg:hidden"
          >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-line">
              <Link to="/" onClick={closeDrawer} className="text-base font-black tracking-tighter text-fg">
                KOBAC <span className="text-primary">Electronics</span>
              </Link>
              <div className="flex items-center gap-1.5">
                <ThemeToggle />
                <button
                  onClick={closeDrawer}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 text-muted hover:text-fg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Nav Links — big & bold ── */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 flex flex-col">
              <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-4">Navigation</p>
              <nav className="flex flex-col gap-0.5">
                {NAV_LINKS.map(({ to, icon: Icon, label, highlight }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={to}
                      onClick={closeDrawer}
                      className={`flex items-center gap-4 px-3 py-4 rounded-2xl transition-all active:scale-[0.97] group ${highlight
                          ? 'text-primary'
                          : 'text-fg hover:bg-surface'
                        }`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${highlight ? 'bg-primary/15' : 'bg-surface-2 group-hover:bg-primary/10'
                        }`}>
                        <Icon size={18} className={highlight ? 'text-primary' : 'text-muted group-hover:text-primary'} />
                      </span>
                      <span className="text-xl font-black tracking-wide">{label}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* ── Search ── */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSearch}
                className="mt-5"
              >
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-surface border border-line rounded-2xl pl-10 pr-4 py-3 text-sm text-fg placeholder-muted/60 focus:outline-none focus:border-primary/40 transition-all"
                  />
                </div>
              </motion.form>
            </div>

            {/* ── Bottom: Account ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="px-5 pt-4 pb-6 border-t border-line bg-surface"
            >
              {userInfo ? (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-4">Account</p>

                  {/* Profile card */}
                  <div className="flex items-center gap-3.5 bg-surface-2 border border-line rounded-2xl px-4 py-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-base shadow-lg shadow-primary/25 shrink-0 overflow-hidden">
                      {userInfo.image ? (
                        <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                      ) : (
                        userInfo.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-fg truncate">{userInfo.name}</p>
                      <p className="text-xs text-muted truncate">{userInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/profile"
                      onClick={closeDrawer}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-2 border border-line text-xs font-semibold text-muted hover:text-fg hover:bg-surface transition-all"
                    >
                      <User size={14} className="text-primary" /> Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={closeDrawer}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-2 border border-line text-xs font-semibold text-muted hover:text-fg hover:bg-surface transition-all"
                    >
                      <Package size={14} className="text-primary" /> Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-xs font-semibold text-danger hover:bg-danger/15 transition-all"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={closeDrawer} className="flex-1">
                    <Button variant="secondary" className="w-full py-3 font-bold tracking-widest uppercase text-sm">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={closeDrawer} className="flex-1">
                    <Button className="w-full py-3 font-black tracking-widest uppercase text-sm shadow-xl shadow-primary/20">Sign Up</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
};

export default Navbar;
