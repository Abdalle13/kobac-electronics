import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingBag, LogOut, CheckCircle2, Users, PieChart, DollarSign, Activity, Power, XCircle, Menu } from 'lucide-react';
import { fetchProducts } from '../redux/slices/productSlice';
import { listOrders, deliverOrder, payOrderAdmin } from '../redux/slices/orderSlice';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { logout } from '../redux/slices/authSlice';

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
    loading: true
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Phone', description: '', price: 0, countInStock: 0,
    ram: '', storage: '', processor: ''
  });
  const [imageFile, setImageFile] = useState(null);

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
          const [usersRes] = await Promise.all([
            api.get('/users')
          ]);

          setDashboardStats(prev => ({
            ...prev,
            totalUsers: usersRes.data.length,
            loading: false
          }));
        } catch (error) {
          console.error('Error fetching stats:', error);
          setDashboardStats(prev => ({ ...prev, loading: false }));
        }
      };
      fetchStats();
    }
  }, [userInfo, dispatch]);

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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'products': return 'Manage Products';
      case 'orders': return 'Customer Orders';
      case 'users': return 'Manage Users';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-[var(--color-background)]">

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden h-16 glass border-b border-white/5 flex items-center justify-between px-6 z-[60] shrink-0">
        <h2 className="text-xl font-black text-white">Admin Pro</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <XCircle size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Premium Glassmorphism */}
      <aside className={`
        fixed inset-0 z-[50] lg:relative lg:inset-auto lg:z-10
        w-full sm:w-64 glass border-r-0 lg:border-r border-white/5 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-tr-3xl hidden lg:block"></div>
        <div className="p-6 relative z-10 hidden lg:block">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary mb-1">Admin Pro</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 relative z-10 mt-4">
          {[
            { id: 'overview', icon: PieChart, label: 'Overview' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'users', icon: Users, label: 'Users' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${activeTab === item.id
                ? 'text-white font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-primary/20 bg-opacity-20 border border-primary/30 rounded-xl"></div>
              )}
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_#0066FF]"></div>
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="relative z-10 tracking-wide text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-xs uppercase">Revenue</h3>
                      </div>
                      <p className="text-3xl font-black text-white">
                        ${orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString('en-US')}
                      </p>
                    </div>

                    {/* Orders Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-xs uppercase">Orders</h3>
                      </div>
                      <p className="text-3xl font-black text-white">{orders.length}</p>
                    </div>

                    {/* Users Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                          <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-xs uppercase">Users</h3>
                      </div>
                      <p className="text-3xl font-black text-white">{dashboardStats.totalUsers}</p>
                    </div>

                    {/* Products Card */}
                    <div className="glass border border-white/5 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                          <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-semibold tracking-wider text-xs uppercase">Products</h3>
                      </div>
                      <p className="text-3xl font-black text-white">{products.length}</p>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="glass border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-black text-white tracking-tight">Recent Transactions</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
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
                          {orders.slice(0, 8).map(o => (
                            <tr key={o._id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4">
                                <p className="text-sm text-white font-bold">{o.user?.name || 'Guest'}</p>
                                <p className="text-[10px] text-gray-500">{o.user?.email}</p>
                              </td>
                              <td className="py-4 text-sm text-white font-black">${o.totalPrice.toLocaleString('en-US')}</td>
                              <td className="py-4">
                                <Badge variant={o.isPaid ? 'success' : 'neutral'} className="text-[9px] px-3 py-1 font-black">
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
                </>
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
                        <td className="p-4 text-white">${product.price.toLocaleString('en-US')}</td>
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
                          <button onClick={() => openEditModal(product)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleProductStatus(product._id)}
                            className={`p-2 rounded-lg transition-colors ${product.status === 'Active' ? 'text-red-400 hover:bg-red-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                            title={product.status === 'Active' ? 'Archive Product' : 'Restore Product'}
                          >
                            {product.status === 'Active' ? <Trash2 className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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
                        <td className="p-4 text-white">${order.totalPrice.toLocaleString('en-US')}</td>
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
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
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

        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
              <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Brand" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />

                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-[var(--color-text-secondary)]">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="bg-[#0d0d0f] border border-[var(--color-border)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Watch">Watch</option>
                  </select>
                </div>

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                        <td className="p-3 text-right">${(item.price * item.qty).toLocaleString('en-US')}</td>
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
                  <p className="text-gray-400">Items: <span className="text-white">${selectedOrder.itemsPrice?.toLocaleString('en-US')}</span></p>
                  <p className="text-gray-400">Shipping: <span className="text-white">${selectedOrder.shippingPrice?.toLocaleString('en-US')}</span></p>
                  <p className="text-xs text-gray-500 mb-1">Tax: ${selectedOrder.taxPrice?.toLocaleString('en-US')}</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">Total: ${selectedOrder.totalPrice?.toLocaleString('en-US')}</p>
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
