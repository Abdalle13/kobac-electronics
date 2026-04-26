import React from 'react';
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
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import ProfilePage from './pages/ProfilePage';
// Will import other pages as we build them

const AppContent = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/register', '/dashboard'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  const hideNavbarRoutes = ['/dashboard', '/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
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
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
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
