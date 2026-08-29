import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import ScrollToTop from './components/routing/ScrollToTop';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import { fetchWishlist, clearWishlist } from './redux/slices/wishlistSlice';
import { fetchSettings } from './redux/slices/settingsSlice';
// Will import other pages as we build them

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [userInfo, dispatch]);
  const hideChromePrefixes = ['/login', '/register', '/dashboard', '/forgot-password', '/reset-password'];
  const hideChrome = hideChromePrefixes.some((p) => location.pathname.startsWith(p));
  const shouldHideFooter = hideChrome;
  const shouldHideNavbar = hideChrome;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <ScrollToTop />
      {!shouldHideNavbar && (
        <>
          <Navbar />
          <CartDrawer />
        </>
      )}

      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-[#1a1a1c] border border-[var(--color-border)] text-white shadow-xl',
          style: {
            background: '#1a1a1c',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <main className="flex-grow flex flex-col w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          
          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
