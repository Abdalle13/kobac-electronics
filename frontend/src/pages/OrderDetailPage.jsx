import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CreditCard, Calendar, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { getOrderDetails } from '../redux/slices/orderSlice';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  if (loading || (!order && !error)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Fetching order manifest...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 inline-block">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/my-orders">
            <Button>Back to My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <Link to="/my-orders" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium tracking-wide uppercase">Back to My Orders</span>
      </Link>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Order Manifest */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                  Order #{order._id?.substring(order._id.length - 12).toUpperCase() || 'UNKNOWN'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {order.orderItems.length} items
                  </div>
                </div>
              </div>
              <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'primary'} className="px-4 py-1.5 text-sm uppercase font-bold tracking-widest">
                {order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Processing')}
              </Badge>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-[#0A0A0B] text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="p-6">Product Item</th>
                    <th className="p-6 text-center">Quantity</th>
                    <th className="p-6 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {order.orderItems.map((item) => (
                    <tr key={item.product} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={item.image || '/placeholder.jpg'} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-2xl object-cover border border-white/5 group-hover:border-primary/50 transition-colors"
                          />
                          <div>
                            <Link to={`/product/${item.product}`} className="text-white font-bold hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                            <p className="text-xs text-gray-500 font-mono tracking-tighter">${(item.price || 0).toLocaleString('en-US')} per unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-bold">{item.qty}</span>
                      </td>
                      <td className="p-6 text-right text-white font-bold">
                        ${((item.price || 0) * (item.qty || 0)).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass border border-white/5 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
              </h3>
              <div className="space-y-2 text-white">
                <p className="font-bold text-lg">{order.user?.name || 'Customer'}</p>
                <p className="text-gray-400">
                  <span className="text-gray-500 font-medium mr-2">Street:</span>
                  {order.shippingAddress?.streetName || 'No street provided'}
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500 font-medium mr-2">City:</span>
                  {order.shippingAddress?.city}
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500 font-medium mr-2">District:</span>
                  {order.shippingAddress?.district}
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500 font-medium mr-2">Landmark:</span>
                  {order.shippingAddress?.landmark}
                </p>
              </div>
            </div>

            <div className="glass border border-white/5 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Method
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                   <p className="font-bold">{order.paymentMethod}</p>
                   {order.isPaid ? (
                      <Badge variant="success" className="text-[10px] px-2 py-0.5">VERIFIED</Badge>
                   ) : (
                      <Badge variant="neutral" className="text-[10px] px-2 py-0.5">UNPAID</Badge>
                   )}
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-gray-400 text-xs mb-1">Status</p>
                   <p className="text-white font-bold">{order.isPaid ? 'Payment Received' : 'Awaiting Payment'}</p>
                   {order.isPaid && <p className="text-[10px] text-gray-500 mt-1">{new Date(order.paidAt).toLocaleString()}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Timeline & Summary */}
        <div className="space-y-8">
          <div className="glass border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-bold text-white mb-6 relative z-10">Order Summary</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-gray-400">
                <span>Items Subtotal</span>
                <span className="text-white font-mono">${(order.itemsPrice || 0).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fees</span>
                <span className="text-white font-mono">${(order.shippingPrice || 0).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-gray-400 pb-4 border-b border-white/5">
                <span>Tax (5%)</span>
                <span className="text-white font-mono">${(order.taxPrice || 0).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-gray-400 font-bold">Total Payable</span>
                <span className="text-3xl font-black text-white">${(order.totalPrice || 0).toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Delivery Progress</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-white/5"></div>
              
              <div className="flex gap-4 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${order.isPaid ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                   <CheckCircle2 size={14} />
                </div>
                <div>
                   <p className={`text-sm font-bold ${order.isPaid ? 'text-white' : 'text-gray-500'}`}>Order Paid</p>
                   {order.isPaid ? (
                     <p className="text-[10px] text-gray-500 mt-1">{new Date(order.paidAt).toLocaleString()}</p>
                   ) : (
                     <p className="text-[10px] text-gray-500 mt-1">Pending verification</p>
                   )}
                </div>
              </div>

              <div className="flex gap-4 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${order.isDelivered ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                   <Truck size={14} />
                </div>
                <div>
                   <p className={`text-sm font-bold ${order.isDelivered ? 'text-white' : 'text-gray-500'}`}>Shipment Delivered</p>
                   {order.isDelivered ? (
                     <p className="text-[10px] text-gray-500 mt-1">{new Date(order.deliveredAt).toLocaleString()}</p>
                   ) : (
                     <p className="text-[10px] text-gray-500 mt-1">Estimated delivery: 2-3 days</p>
                   )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-primary/10 border border-primary/20 text-center">
             <Package className="w-10 h-10 text-primary mx-auto mb-3" />
             <h4 className="text-sm font-bold text-white mb-2">Need Help with this Order?</h4>
             <p className="text-xs text-gray-400 mb-4 px-4">Our support team is available 24/7 to assist with your technical questions.</p>
             <Link to="/contact">
               <Button size="sm" variant="ghost" className="w-full text-xs font-bold border-primary/30 text-white hover:bg-primary/20">Contact Support</Button>
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailPage;
