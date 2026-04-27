import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, addToCart } from '../../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatter';

const CartDrawer = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector(state => state.cart);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[380px] md:w-96 glass z-[70] transform transition-transform duration-300 ease-in-out border-l border-white/[0.07] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-white/[0.07] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-white">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-primary/15 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
              <p className="text-gray-600 text-xs mb-5">Add items from the shop to get started.</p>
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-sm border border-white/10">
                Continue Shopping
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.07]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#111] shrink-0">
                  <img
                    src={item.images?.[0] || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate leading-tight mb-0.5">{item.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{formatCurrency(item.price)}</p>
                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg px-1 py-0.5">
                      <button
                        onClick={() => dispatch(addToCart({ ...item, qty: item.qty - 1 }))}
                        disabled={item.qty <= 1}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-bold text-white w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => dispatch(addToCart({ ...item, qty: item.qty + 1 }))}
                        disabled={item.qty >= item.countInStock}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    {/* Line total + remove */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-4 sm:px-5 py-4 border-t border-white/[0.07] bg-[#0D0D0F] shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400 font-medium">Subtotal</span>
              <span className="text-xl font-black text-white">{formatCurrency(cartTotal)}</span>
            </div>
            <p className="text-[10px] text-gray-600 mb-3">Shipping and taxes calculated at checkout.</p>
            <Button variant="primary" className="w-full py-3.5 text-sm font-bold" onClick={handleCheckout}>
              Checkout →
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
