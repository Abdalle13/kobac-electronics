import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewTab from '../components/admin/OverviewTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';
import UsersTab from '../components/admin/UsersTab';
import PaymentsTab from '../components/admin/PaymentsTab';
import SettingsTab from '../components/admin/SettingsTab';

const TITLES = {
  overview: 'Dashboard Overview',
  products: 'Manage Products',
  orders: 'Customer Orders',
  users: 'Manage Users',
  finance: 'Payment Analytics',
  settings: 'Dashboard Settings',
};

const SEARCHABLE = ['products', 'orders', 'users'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userInfo || userInfo.role?.toLowerCase() !== 'admin') navigate('/login');
  }, [userInfo, navigate]);

  if (!userInfo || userInfo.role?.toLowerCase() !== 'admin') return null;

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const selectTab = (id) => { setActiveTab(id); setSearch(''); };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-canvas text-fg">
      {/* Mobile header */}
      <div className="lg:hidden h-16 bg-surface border-b border-line flex items-center justify-between px-5 z-[80] shrink-0">
        <span className="text-base font-bold tracking-tight text-fg">KOBAC <span className="text-primary">Electronics</span></span>
        <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 text-muted hover:text-fg transition-colors">
          <Menu size={20} />
        </button>
      </div>

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={selectTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 lg:h-20 bg-surface/60 backdrop-blur-md border-b border-line flex items-center gap-4 px-4 lg:px-8 z-20 shrink-0">
          <h1 className="text-lg lg:text-2xl font-bold text-fg tracking-wide truncate">{TITLES[activeTab]}</h1>
          {SEARCHABLE.includes(activeTab) && (
            <div className="max-w-xs w-full relative hidden md:block ml-auto">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder={`Search ${activeTab}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-canvas border border-line rounded-xl py-2 pl-9 pr-4 text-sm text-fg placeholder-muted/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab search={search} />}
          {activeTab === 'orders' && <OrdersTab search={search} />}
          {activeTab === 'users' && <UsersTab search={search} />}
          {activeTab === 'finance' && <PaymentsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
