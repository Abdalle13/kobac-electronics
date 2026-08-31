import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, LogOut, Settings,
  Package, ShieldCheck, Zap, X, Mail, Home, Store, Info, Heart, ChevronDown, Bike,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CartDrawer from './CartDrawer';
import { logout } from '../../redux/slices/authSlice';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.auth);
  const { freeShippingThreshold } = useSelector((s) => s.settings);

  const role = userInfo?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isRider = role === 'rider';
  const isStaff = isAdmin || isRider;
  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/shop?keyword=${keyword}` : '/shop');
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: Store, label: 'Shop' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/contact', icon: Mail, label: 'Support' },
    ...(userInfo && !isStaff ? [
      { to: '/wishlist', icon: Heart, label: 'Favorites' },
      { to: '/my-orders', icon: Package, label: 'Orders' },
    ] : []),
    ...(userInfo ? [{ to: '/settings', icon: Settings, label: 'Settings' }] : []),
    ...(isRider ? [{ to: '/rider', icon: Bike, label: 'Deliveries' }] : []),
    ...(isAdmin ? [{ to: '/dashboard', icon: ShieldCheck, label: 'Dashboard' }] : []),
  ];

  return (
    <>
      {/* Promo bar */}
      {!isStaff && (
        <div className="bg-primary text-on-primary text-[10px] sm:text-xs font-medium py-1.5 sm:py-2 text-center">
          <span className="flex items-center justify-center gap-2 px-4">
            <Zap size={12} className="animate-pulse shrink-0" />
            <span className="truncate">
              Spend ${freeShippingThreshold}+ and get free delivery
              <span className="hidden sm:inline"> (limited time)</span>
            </span>
          </span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 w-full z-[60] glass border-b border-line h-16 sm:h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          <Link to="/" className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-fg shrink-0">
            KOBAC <span className="text-primary">Electronics</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {isAdmin ? (
              <Link to="/dashboard" className="text-primary hover:text-primary-hover transition-colors font-semibold">Admin Dashboard</Link>
            ) : isRider ? (
              <Link to="/rider" className="text-primary hover:text-primary-hover transition-colors font-semibold">Deliveries</Link>
            ) : (
              [
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Support' },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `transition-colors ${isActive ? 'text-fg font-semibold' : 'text-muted hover:text-fg'}`}
                >
                  {label}
                </NavLink>
              ))
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden lg:block relative group mr-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search products…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-surface border border-line rounded-full py-2 pl-9 pr-4 text-xs text-fg focus:outline-none focus:border-primary/50 w-36 focus:w-52 transition-all duration-300"
              />
            </form>

            {!userInfo && (
              <div className="hidden sm:flex items-center gap-2 mr-1">
                <Link to="/login"><Button variant="ghost" className="text-xs font-medium px-3">Sign in</Button></Link>
                <Link to="/register"><Button className="text-xs font-semibold px-4 py-2 rounded-full">Sign up</Button></Link>
              </div>
            )}

            <ThemeToggle />

            {!isStaff && (
              <button onClick={() => setIsCartOpen(true)} className="relative text-muted hover:text-fg transition-colors p-2" aria-label="Open cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-on-primary ring-2 ring-canvas">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop profile dropdown */}
            {userInfo && (
              <div className="hidden lg:block relative ml-1">
                <button
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-full pl-1.5 pr-2.5 py-1.5 border transition-all ${
                    isUserMenuOpen ? 'bg-surface-2 border-line' : 'bg-surface border-line hover:bg-surface-2'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-on-primary">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-fg max-w-[90px] truncate">{userInfo.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-3 w-64 bg-surface border border-line rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        {/* Identity */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-on-primary shrink-0">
                            {userInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-fg truncate">{userInfo.name}</p>
                            <p className="text-xs text-muted truncate">{userInfo.email}</p>
                          </div>
                        </div>

                        <div className="p-1.5">
                          {isAdmin && (
                            <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition-all">
                              <ShieldCheck size={15} className="text-primary" /> Admin Dashboard
                            </Link>
                          )}
                          {isRider && (
                            <Link to="/rider" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition-all">
                              <Bike size={15} className="text-primary" /> Deliveries
                            </Link>
                          )}
                          {!isStaff && (
                            <>
                              <Link to="/my-orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition-all">
                                <Package size={15} className="text-muted" /> My Orders
                              </Link>
                              <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition-all">
                                <Heart size={15} className="text-muted" /> Favorites
                              </Link>
                            </>
                          )}
                          <Link to="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-surface-2 transition-all">
                            <Settings size={15} className="text-muted" /> Settings
                          </Link>
                        </div>

                        <div className="p-1.5 border-t border-line">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all text-left">
                            <LogOut size={15} /> Log out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-muted hover:text-fg transition-colors p-2" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — right side slide-over */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
      />
      <aside
        className={`lg:hidden fixed inset-y-0 right-0 w-[82%] max-w-xs bg-canvas border-l border-line z-[110] flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <span className="text-base font-bold tracking-tight text-fg">Menu</span>
          <button onClick={closeMenu} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface text-muted hover:text-fg transition-all">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={closeMenu}
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-[15px] transition-colors ${
                isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-fg font-medium hover:bg-surface-2'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-line shrink-0">
          {userInfo ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-danger bg-danger/10 hover:bg-danger/15 transition-colors"
            >
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={closeMenu} className="flex-1"><Button variant="secondary" className="w-full text-sm font-medium">Sign in</Button></Link>
              <Link to="/register" onClick={closeMenu} className="flex-1"><Button className="w-full text-sm font-semibold">Sign up</Button></Link>
            </div>
          )}
        </div>
      </aside>

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
};

export default Navbar;
