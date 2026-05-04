import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingBag, LogOut, CheckCircle2, Users, PieChart, DollarSign, Settings, Activity, Power, XCircle, Menu } from 'lucide-react';
import { fetchProducts } from '../redux/slices/productSlice';
import { listOrders, deliverOrder, payOrderAdmin } from '../redux/slices/orderSlice';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { logout } from '../redux/slices/authSlice';
import { formatCurrency } from '../utils/formatter';

const MOCK_MONTHLY_DATA = [
  { date: 'Jan', amount: 4200 },
  { date: 'Feb', amount: 6800 },
  { date: 'Mar', amount: 5100 },
  { date: 'Apr', amount: 9400 },
  { date: 'May', amount: 7200 },
  { date: 'Jun', amount: 11500 },
  { date: 'Jul', amount: 8900 },
  { date: 'Aug', amount: 13200 },
  { date: 'Sep', amount: 10600 },
  { date: 'Oct', amount: 15800 },
  { date: 'Nov', amount: 12400 },
  { date: 'Dec', amount: 18900 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { products, loading: productsLoading } = useSelector((state) => state.products);
  const { orders, loading: ordersLoading } = useSelector((state) => state.order);

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    percentageChange: 0,
    loading: true,
    monthlySales: []
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Phone', description: '', price: 0, countInStock: 0,
    ram: '', storage: '', processor: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [financeData, setFinanceData] = useState({
    totalSales: 0,
    numOrders: 0,
    evcSales: 0,
    codSales: 0,
    salesByDay: {},
    loading: true
  });
  const [profileForm, setProfileForm] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    supportEmail: '',
    supportPhone: '',
    freeShippingThreshold: 400,
    heroBanners: [],
    loading: true
  });
  const [newBanner, setNewBanner] = useState(null);

  useEffect(() => {
    // If not admin, redirect
    if (!userInfo || !userInfo.role || userInfo.role.toLowerCase() !== 'admin') {
      navigate('/login');
      return;
    }
    dispatch(fetchProducts(''));
  }, [dispatch, userInfo, navigate]);

  useEffect(() => {
    if (activeTab === 'users' && userInfo && userInfo.role === 'Admin') {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/users');
          setUsersList(res.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [activeTab, userInfo]);

  useEffect(() => {
  }, [userInfo, navigate]);

  useEffect(() => {
    if (userInfo && userInfo.role === 'Admin') {
      // Fetch everything needed for the overview immediately
      dispatch(listOrders());
      dispatch(fetchProducts(''));
      
      const fetchStats = async () => {
        try {
          const [usersRes, summaryRes] = await Promise.all([
            api.get('/users'),
            api.get('/orders/summary')
          ]);

          // Prepare chart data from salesByDay
          const chartData = Object.entries(summaryRes.data.salesByDay || {})
            .map(([date, amount]) => ({
              date: date.split('/')[0] + '/' + date.split('/')[1], // Short date MM/DD
              amount: amount
            }))
            .slice(-7); // Last 7 data points

          setDashboardStats(prev => ({
            ...prev,
            totalUsers: usersRes.data.length,
            monthlySales: chartData,
            loading: false
          }));

          setFinanceData({
            totalSales: summaryRes.data.totalSales || 0,
            numOrders: summaryRes.data.numOrders || 0,
            evcSales: summaryRes.data.evcSales || 0,
            codSales: summaryRes.data.codSales || 0,
            salesByDay: summaryRes.data.salesByDay || {},
            loading: false
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
          setDashboardStats(prev => ({ ...prev, loading: false }));
          setFinanceData(prev => ({ ...prev, loading: false }));
        }
      };
      fetchStats();
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (activeTab === 'settings' && userInfo && userInfo.role === 'Admin') {
      const fetchSettings = async () => {
        try {
          const res = await api.get('/settings');
          setStoreSettings({ ...res.data, loading: false });
        } catch (error) {
          console.error('Error fetching settings:', error);
          setStoreSettings(prev => ({ ...prev, loading: false }));
        }
      };
      fetchSettings();
    }
  }, [activeTab, userInfo]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: '', category: 'Phone', description: '', price: 0, countInStock: 0, ram: '', storage: '', processor: '' });
    setImageFile(null);
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      price: product.price,
      countInStock: product.countInStock,
      ram: product.technicalSpecs?.ram || '',
      storage: product.technicalSpecs?.storage || '',
      processor: product.technicalSpecs?.processor || ''
    });
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        dispatch(fetchProducts(''));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedImagePath = editingProduct?.images?.[0] || '';

      // Upload image first if a new one is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/upload', formData);
        uploadedImagePath = uploadRes.data;
      }

      // Structure the JSON payload exactly as backend expects
      const payload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock),
        technicalSpecs: {
          ram: formData.ram,
          storage: formData.storage,
          processor: formData.processor,
        },
        images: uploadedImagePath ? [uploadedImagePath] : []
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        // Backend creates a dummy product first, so we POST and then PUT
        const createdResponse = await api.post('/products');
        const newProductId = createdResponse.data._id;
        await api.put(`/products/${newProductId}`, payload);
      }

      setShowProductModal(false);
      dispatch(fetchProducts(''));
    } catch (err) {
      console.error(err);
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeliverOrder = async (id) => {
    if (window.confirm('Mark this order as delivered?')) {
      await dispatch(deliverOrder(id));
      dispatch(listOrders());
    }
  };

  const handlePayOrder = async (id) => {
    if (window.confirm('Mark this order as paid?')) {
      await dispatch(payOrderAdmin(id));
      dispatch(listOrders());
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore stock for all items.')) {
      try {
        await api.put(`/orders/${id}/cancel`);
        dispatch(listOrders());
      } catch (err) {
        console.error(err);
        alert('Error cancelling order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleToggleProductStatus = async (id) => {
    try {
      await api.put(`/products/${id}/status`);
      dispatch(fetchProducts(''));
    } catch (err) {
      console.error(err);
      alert('Error updating product status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/users/${id}/status`);
      // Refresh users list
      const res = await api.get('/users');
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
      alert('Error toggling user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.password !== profileForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const { data } = await api.put('/users/profile', {
        name: profileForm.name,
        email: profileForm.email,
        password: profileForm.password
      });
      alert('Profile updated successfully! Some changes may require re-login.');
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'products': return 'Manage Products';
      case 'orders': return 'Customer Orders';
      case 'users': return 'Manage Users';
      case 'finance': return 'Payment Analytics';
      case 'settings': return 'Dashboard Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-[#050505] text-white">

      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-[80] shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-black tracking-tighter text-white">KOBAC <span className="text-primary">Electronics</span></span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <XCircle size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[65]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] lg:relative lg:inset-auto lg:z-10
        w-72 bg-[#080809]/95 backdrop-blur-3xl border-r border-white/[0.06]
        flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isSidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full lg:translate-x-0 opacity-100 pointer-events-none lg:pointer-events-auto'}
      `}>

        {/* Brand — aligned with header */}
        <div className="h-16 lg:h-20 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <div>
            <span className="text-lg font-black tracking-tighter text-white">KOBAC <span className="text-primary">Electronics</span></span>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase mt-0.5">Admin Suite</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <XCircle size={18} />
          </button>
        </div>

        {/* Nav Links — evenly spaced */}
        <div className="flex-1 flex flex-col justify-evenly overflow-y-auto px-4 py-4">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2 px-2">Navigation</p>
          <nav className="flex flex-col gap-1">
            {[
              { id: 'overview', icon: PieChart,    label: 'Overview' },
              { id: 'products', icon: Package,     label: 'Products' },
              { id: 'orders',   icon: ShoppingBag, label: 'Orders'   },
              { id: 'users',    icon: Users,        label: 'Users'    },
              { id: 'finance',  icon: DollarSign,  label: 'Payments' },
              { id: 'settings', icon: Settings,    label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === item.id ? 'bg-primary/15' : 'bg-white/[0.05] group-hover:bg-primary/10'
                }`}>
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`} />
                </span>
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile only — name/email card */}
        <div className="lg:hidden px-4 pb-3 shrink-0">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/25 shrink-0 overflow-hidden">
              {userInfo?.image
                ? <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                : userInfo?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{userInfo?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{userInfo?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Logout — pinned at bottom */}
        <div className="px-4 pb-5 pt-2 border-t border-white/[0.06] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 group text-red-500/60 hover:text-red-400 hover:bg-red-500/[0.07] border border-transparent hover:border-red-500/10"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.05] group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>



      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Admin Specific Header */}
        <header className="h-16 lg:h-20 glass border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
          <div className="flex-1 flex items-center gap-4 lg:gap-8">
            <h1 className="text-lg lg:text-2xl font-bold text-white tracking-wide truncate">{getTabTitle()}</h1>
            {(activeTab !== 'overview') && (
              <div className="max-w-md w-full relative hidden lg:block">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{userInfo?.name || 'Admin User'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(0,102,255,0.4)]">
              {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {(dashboardStats.loading || ordersLoading || productsLoading) ? (
                <div className="flex justify-center py-20 text-gray-500">Loading metrics...</div>
              ) : (
                <div className="px-4 sm:px-0 space-y-6 sm:space-y-8 pb-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-[10px] uppercase">Total Revenue</h3>
                      </div>
                      <p className="text-3xl font-black text-white relative z-10">
                        {formatCurrency(orders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0))}
                      </p>
                    </div>

                    {/* Orders Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl group-hover:bg-green-500/10 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-[10px] uppercase">Orders</h3>
                      </div>
                      <p className="text-3xl font-black text-white relative z-10">{orders.length}</p>
                    </div>

                    {/* Users Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                          <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-[10px] uppercase">Active Users</h3>
                      </div>
                      <p className="text-3xl font-black text-white relative z-10">{dashboardStats.totalUsers}</p>
                    </div>

                    {/* Catalog Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                          <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-[10px] uppercase">Products</h3>
                      </div>
                      <p className="text-3xl font-black text-white relative z-10">{products.length}</p>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="glass border border-white/5 sm:rounded-3xl rounded-none -mx-4 sm:mx-0 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase italic">Monthly Revenue</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Sales performance over time</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-primary/10">
                        <Activity size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Live Growth</span>
                      </div>
                    </div>
                    
                    <div className="h-[260px] sm:h-[360px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dashboardStats.monthlySales.length > 0 ? dashboardStats.monthlySales : MOCK_MONTHLY_DATA}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                            dy={12}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 700 }}
                            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                            width={38}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            cursor={{ stroke: 'rgba(59,130,246,0.15)', strokeWidth: 2 }}
                            contentStyle={{
                              backgroundColor: 'rgba(5,5,5,0.97)',
                              border: '1px solid rgba(59,130,246,0.15)',
                              borderRadius: '16px',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                              padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}
                            labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '2px' }}
                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={2000}
                            dot={false}
                            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#050505' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="glass border border-white/5 sm:rounded-3xl rounded-none -mx-4 sm:mx-0 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase italic">Recent Transactions</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Latest Store Activity</p>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5">View All</button>
                    </div>
                    <div className="overflow-x-auto relative z-10">
                      <table className="w-full text-left">
                        <thead className="text-gray-500 text-[10px] uppercase tracking-widest font-black">
                          <tr className="border-b border-white/5">
                            <th className="pb-4">Customer</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orders.slice(0, 5).map(o => (
                            <tr key={o._id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors border border-white/10">
                                    {o.user?.name?.charAt(0) || 'G'}
                                  </div>
                                  <div>
                                    <p className="text-xs text-white font-black">{o.user?.name || 'Guest'}</p>
                                    <p className="text-[9px] text-gray-500 tracking-wider uppercase">{o._id.substring(0, 8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-xs text-white font-black">{formatCurrency(o.totalPrice)}</td>
                              <td className="py-4">
                                <Badge variant={o.isPaid ? 'success' : 'neutral'} className="text-[8px] px-2.5 py-1 font-black tracking-widest">
                                  {o.isPaid ? 'PAID' : 'PENDING'}
                                </Badge>
                              </td>
                              <td className="py-4 text-right text-[10px] text-gray-500 font-bold">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-end items-center mb-8">
                <Button onClick={openAddModal} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </div>

              <div className="glass border border-white/5 rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-4 font-medium">ID / Name</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium lg:table-cell hidden">Stock</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {productsLoading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                    ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                      <tr key={product._id} className="hover:bg-[#111] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} className="w-10 h-10 rounded border border-gray-800 object-cover" />
                            <div>
                              <p className="text-white font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">{product._id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white">{formatCurrency(product.price)}</td>
                        <td className="p-4"><Badge variant="neutral">{product.category}</Badge></td>
                        <td className="p-4 lg:table-cell hidden">
                          <span className={product.countInStock > 0 ? 'text-green-500' : 'text-red-500'}>
                            {product.countInStock}
                          </span>
                        </td>
                        <td className="p-4 text-white">
                          <Badge variant={product.status === 'Active' ? 'success' : 'neutral'}>
                            {product.status || 'Active'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => openEditModal(product)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit Product">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="glass border border-white/5 rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-4 font-medium">Order ID</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {orders.filter(o => o._id.toLowerCase().includes(searchTerm.toLowerCase()) || o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(order => (
                      <tr key={order._id} className="hover:bg-[#111] transition-colors">
                        <td className="p-4 text-xs text-gray-400">{order._id.substring(0, 12)}...</td>
                        <td className="p-4 text-white">{order.user?.name || 'Guest'}</td>
                        <td className="p-4 text-white">{formatCurrency(order.totalPrice)}</td>
                        <td className="p-4">
                          <Badge variant={order.isDelivered ? 'success' : 'neutral'}>
                            {order.isDelivered ? 'Delivered' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {!order.isPaid && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 border-none text-xs px-3 py-1.5"
                              onClick={() => dispatch(payOrderAdmin(order._id))}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {!order.isDelivered && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 border-none text-xs px-3 py-1.5"
                              onClick={() => handleDeliverOrder(order._id)}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button size="sm" className="text-xs bg-[#242428] hover:bg-[#2F2F35] border border-white/10 text-white shadow-lg px-3 py-1.5" onClick={() => setSelectedOrder(order)}>
                            View Details
                          </Button>
                          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                            <button onClick={() => handleCancelOrder(order._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1" title="Cancel Order">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="glass border border-white/5 rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {usersList.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                    ) : usersList.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                      <tr key={user._id} className="hover:bg-[#111] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <span className="text-white font-medium">{user.name}</span>
                        </td>
                        <td className="p-4 text-gray-400">
                          <a href={`mailto:${user.email}`} className="hover:text-white transition-colors">{user.email}</a>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.role === 'Admin' ? 'primary' : 'neutral'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {userInfo._id !== user._id && (
                            <button
                              onClick={() => handleToggleStatus(user._id)}
                              className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                              title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              {financeData.loading ? (
                <div className="flex justify-center py-20 text-gray-500">Calculating financials...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-blue-600/10 to-transparent">
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Total Paid Sales</p>
                      <p className="text-4xl font-black text-white">{formatCurrency(financeData.totalSales)}</p>
                      <p className="text-[10px] text-blue-400 mt-2 font-bold uppercase tracking-wider">From {financeData.numOrders} Orders</p>
                    </div>
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">EVC Plus Sales</p>
                      <p className="text-3xl font-black text-blue-400">{formatCurrency(financeData.evcSales)}</p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                         <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(financeData.evcSales / (financeData.totalSales || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Cash on Delivery</p>
                      <p className="text-3xl font-black text-green-400">{formatCurrency(financeData.codSales)}</p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                         <div className="bg-green-400 h-full rounded-full" style={{ width: `${(financeData.codSales / (financeData.totalSales || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="glass border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <h3 className="text-lg font-black text-white mb-6 tracking-tight">Sales History (Paid)</h3>
                    <div className="space-y-4">
                      {Object.keys(financeData.salesByDay).length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No sales history yet.</p>
                      ) : Object.entries(financeData.salesByDay).map(([date, amount]) => (
                        <div key={date} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                              {date.split('/')[0]}/{date.split('/')[1]}
                            </div>
                            <span className="text-gray-300 font-bold text-sm">{date}</span>
                          </div>
                          <span className="text-white font-black">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Store Configuration Card */}
              <div className="glass border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white mb-2">Store Configuration</h3>
                  <p className="text-gray-500 text-sm">Global settings for your shop identity and shipping.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Store Name" 
                      value={storeSettings.storeName} 
                      onChange={e => setStoreSettings({...storeSettings, storeName: e.target.value})}
                      placeholder="e.g. Kobac Electronics"
                    />
                    <Input 
                      label="Free Shipping Threshold ($)" 
                      type="number"
                      value={storeSettings.freeShippingThreshold} 
                      onChange={e => setStoreSettings({...storeSettings, freeShippingThreshold: Number(e.target.value)})}
                      placeholder="e.g. 400"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Support Email" 
                      type="email"
                      value={storeSettings.supportEmail} 
                      onChange={e => setStoreSettings({...storeSettings, supportEmail: e.target.value})}
                      placeholder="support@kobac.com"
                    />
                    <Input 
                      label="Support Phone" 
                      value={storeSettings.supportPhone} 
                      onChange={e => setStoreSettings({...storeSettings, supportPhone: e.target.value})}
                      placeholder="+252 61 XXXXXXX"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={async () => {
                        try {
                          await api.put('/settings', storeSettings);
                          alert('Store settings saved!');
                        } catch (err) { alert(err.message); }
                      }}
                      className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                      Save Store Info
                    </Button>
                  </div>
                </div>
              </div>

              {/* Banner Management */}
              <div className="glass border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <h3 className="text-xl font-black text-white mb-6">Home Page Banners</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                   {storeSettings.heroBanners.map((banner, idx) => (
                     <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10">
                        <img src={banner} className="w-full h-full object-cover" alt="Banner" />
                        <button 
                          onClick={() => {
                            const newBanners = storeSettings.heroBanners.filter((_, i) => i !== idx);
                            setStoreSettings({...storeSettings, heroBanners: newBanners});
                          }}
                          className="absolute top-2 right-2 bg-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                     </div>
                   ))}
                   <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl aspect-video bg-white/[0.02]">
                      <input 
                        type="file" 
                        id="banner-upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if(file) {
                            const formData = new FormData();
                            formData.append('image', file);
                            const res = await api.post('/upload', formData);
                            setStoreSettings({...storeSettings, heroBanners: [...storeSettings.heroBanners, res.data]});
                          }
                        }}
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center">
                         <Plus className="text-gray-500 mb-2" />
                         <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Add Banner</span>
                      </label>
                   </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-white/5">
                   <Button 
                    onClick={async () => {
                      try {
                        await api.put('/settings', storeSettings);
                        alert('Banners updated successfully!');
                      } catch (err) { alert(err.message); }
                    }}
                    className="px-8"
                   >
                     Apply Banners
                   </Button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="glass border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full"></div>
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white mb-2">Admin Profile Settings</h3>
                  <p className="text-gray-500 text-sm">Manage your personal admin account details and security.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      value={profileForm.name} 
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                      placeholder="Admin Name"
                    />
                    <Input 
                      label="Email Address" 
                      type="email"
                      value={profileForm.email} 
                      onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                      placeholder="admin@kobac.com"
                    />
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Security Update</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                          label="New Password" 
                          type="password"
                          value={profileForm.password} 
                          onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                          placeholder="••••••••"
                        />
                        <Input 
                          label="Confirm Password" 
                          type="password"
                          value={profileForm.confirmPassword} 
                          onChange={e => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                       </div>
                       <p className="text-[10px] text-gray-500 mt-2">Leave blank if you don't want to change the password.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button type="submit" className="px-10 py-4 h-auto text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
              <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Brand" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />

                <Input 
                  label="Category" 
                  placeholder="e.g. Phone, Gaming, Home Appliances"
                  required 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })} 
                />

                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-[var(--color-text-secondary)]">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="bg-[#0d0d0f] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-[var(--color-primary)] text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)]"
                  />
                  {editingProduct && !imageFile && (
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing image</p>
                  )}
                </div>

                <Input label="Price ($)" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                <Input label="Stock Count" type="number" required value={formData.countInStock} onChange={e => setFormData({ ...formData, countInStock: e.target.value })} />
              </div>

              <div>
                <label className="mb-1 text-sm text-[var(--color-text-secondary)] block">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0d0d0f] border border-[var(--color-border)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] min-h-[100px]"
                />
              </div>

              <div className="border border-gray-800 rounded-lg p-4 bg-[#0a0a0b]">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Processor" value={formData.processor} onChange={e => setFormData({ ...formData, processor: e.target.value })} className="mb-0" />
                  <Input label="RAM" value={formData.ram} onChange={e => setFormData({ ...formData, ram: e.target.value })} className="mb-0" />
                  <Input label="Storage" value={formData.storage} onChange={e => setFormData({ ...formData, storage: e.target.value })} className="mb-0" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button type="button" variant="ghost" onClick={() => setShowProductModal(false)}>Cancel</Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
              <h2 className="text-xl font-bold text-white">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6 text-left text-sm text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Customer Info</h3>
                  <p><span className="text-white">Name:</span> {selectedOrder.user?.name || 'Unknown'}</p>
                  <p><span className="text-white">Email:</span> {selectedOrder.user?.email || 'Unknown'}</p>
                  <p className="mt-2 text-xs"><span className="text-white">Order ID:</span> {selectedOrder._id}</p>
                  <p className="text-xs"><span className="text-white">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Shipping Address</h3>
                  <p><span className="text-gray-500 font-medium">Street:</span> {selectedOrder.shippingAddress?.streetName}</p>
                  <p><span className="text-gray-500 font-medium">City:</span> {selectedOrder.shippingAddress?.city}</p>
                  <p><span className="text-gray-500 font-medium">District:</span> {selectedOrder.shippingAddress?.district}</p>
                  <p><span className="text-gray-500 font-medium">Landmark:</span> {selectedOrder.shippingAddress?.landmark}</p>
                </div>
              </div>

              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {selectedOrder.orderItems?.map(item => (
                      <tr key={item._id || item.product}>
                        <td className="p-3 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-gray-700" />
                          <span className="text-white">{item.name}</span>
                        </td>
                        <td className="p-3 text-center">{item.qty}</td>
                        <td className="p-3 text-right">{formatCurrency(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end border-t border-gray-800 pt-4">
                <div className="space-y-1">
                  <p><span className="text-gray-400">Payment Method:</span> <span className="text-white">{selectedOrder.paymentMethod}</span></p>
                  <p><span className="text-gray-400">Paid:</span> {selectedOrder.isPaid ? <span className="text-green-500 font-medium">Yes ({new Date(selectedOrder.paidAt).toLocaleDateString()})</span> : <span className="text-red-500">Not Paid</span>}</p>
                  <p><span className="text-gray-400">Delivered:</span> {selectedOrder.isDelivered ? <span className="text-green-500 font-medium">Yes ({new Date(selectedOrder.deliveredAt).toLocaleDateString()})</span> : <span className="text-red-500">Pending</span>}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Items: <span className="text-white">{formatCurrency(selectedOrder.itemsPrice)}</span></p>
                  <p className="text-gray-400">Shipping: <span className="text-white">{formatCurrency(selectedOrder.shippingPrice)}</span></p>
                  <p className="text-xs text-gray-500 mb-1">Tax: {formatCurrency(selectedOrder.taxPrice)}</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">Total: {formatCurrency(selectedOrder.totalPrice)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex justify-end gap-3 bg-[#0a0a0b] rounded-b-2xl">
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* No mobile bottom nav needed anymore as we have the hamburger menu */}
    </div>
  );
};

export default AdminDashboard;
