import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { listMyOrders } from '../redux/slices/orderSlice';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full flex-grow">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-gray-400">Track and manage your current and past purchases.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[var(--color-surface)]/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-surface)]/30 border border-dashed border-[var(--color-border)] rounded-3xl">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No orders found</h2>
          <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
          <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {orders.map((order) => (
            <motion.div 
              key={order._id} 
              variants={itemVariants}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-tighter">Order #{order._id.substring(order._id.length - 8)}</span>
                    <Badge variant={order.isPaid ? 'primary' : 'neutral'}>
                      {order.isPaid ? 'Paid' : 'Payment Pending'}
                    </Badge>
                  </div>

                  <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                    {order.orderItems.map((item, idx) => (
                      <img 
                        key={idx} 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-gray-800 flex-shrink-0"
                      />
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Status: <span className="text-white">{order.isDelivered ? 'Delivered' : 'In Transit'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-white">${order.totalPrice.toLocaleString('en-US')}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex items-center gap-2 mt-4 md:mt-0"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    Order Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MyOrdersPage;
