import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { clearCart } from '../redux/slices/cartSlice';
import { createOrder, payOrder, resetOrder } from '../redux/slices/orderSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useEffect } from 'react';

const CheckoutPage = () => {
  const { cartItems } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);
  const { order, success, error, loading } = useSelector(state => state.order);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ 
    fullName: '', 
    streetName: '', 
    city: '', 
    district: '', 
    landmark: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('EVC Plus');
  const [evcNumber, setEvcNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice >= 400 ? 0 : 15;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2)); // 5% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(clearCart());
      dispatch(resetOrder());
    }
  }, [isSuccess, dispatch]);

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full flex-grow">
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.images[0],
        price: item.price,
        product: item._id
      })),
      shippingAddress: {
        streetName: shipping.streetName,
        city: shipping.city,
        district: shipping.district,
        landmark: shipping.landmark
      },
      paymentMethod: paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    const resultAction = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(resultAction)) {
      const createdOrder = resultAction.payload;
      
      if (paymentMethod === 'EVC Plus') {
        // Mock EVC Plus Payment call
        const paymentResult = {
          transactionId: 'EVC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          payer_phone: evcNumber
        };
        await dispatch(payOrder({ id: createdOrder._id, paymentResult }));
      }
      
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full flex-grow px-4">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Thank you for your purchase. Your order has been placed and is being processed. 
          You will receive an email confirmation shortly.
        </p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-grow">
      
      {/* Checkout Steps Indicator */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 1 ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]' : 'bg-gray-800 border border-gray-700'}`}>
            1
          </div>
          <span className="font-medium hidden sm:inline">Shipping</span>
        </div>
        <ChevronRight className="w-5 h-5 mx-2 md:mx-4 text-gray-600" />
        <div className={`flex items-center ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 2 ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]' : 'bg-gray-800 border border-gray-700'}`}>
            2
          </div>
          <span className="font-medium hidden sm:inline">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Forms */}
        <div className="md:col-span-2">
          {step === 1 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Shipping Details</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <Input 
                  label="Full Name" 
                  required 
                  value={shipping.fullName} 
                  onChange={e => setShipping({...shipping, fullName: e.target.value})} 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="City" 
                    placeholder="e.g. Muqdisho, Hargeisa"
                    required 
                    value={shipping.city} 
                    onChange={e => setShipping({...shipping, city: e.target.value})} 
                  />
                  <Input 
                    label="District" 
                    placeholder="e.g. Hodan, Karan"
                    required 
                    value={shipping.district} 
                    onChange={e => setShipping({...shipping, district: e.target.value})} 
                  />
                </div>

                <Input 
                  label="Street Name / House No" 
                  required 
                  value={shipping.streetName} 
                  onChange={e => setShipping({...shipping, streetName: e.target.value})} 
                />

                <Input 
                  label="Nearest Landmark" 
                  placeholder="e.g. Near Masjidka Isbaheysiga"
                  required 
                  value={shipping.landmark} 
                  onChange={e => setShipping({...shipping, landmark: e.target.value})} 
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">Continue to Payment</Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
              <form onSubmit={handlePaymentSubmit}>
                
                <div className="space-y-4 mb-8">
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'EVC Plus' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-700 bg-[#111] hover:bg-gray-800'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="EVC Plus" 
                      checked={paymentMethod === 'EVC Plus'} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-[var(--color-primary)]"
                    />
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center border border-blue-500/30">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">EVC Plus</h3>
                      <p className="text-sm text-gray-400">Mobile Money Payment</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-700 bg-[#111] hover:bg-gray-800'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Cash on Delivery" 
                      checked={paymentMethod === 'Cash on Delivery'} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-[var(--color-primary)]"
                    />
                    <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/30">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Cash on Delivery</h3>
                      <p className="text-sm text-gray-400">Pay when you receive</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'EVC Plus' && (
                  <div className="bg-[#0a0a0b] border border-gray-800 rounded-xl p-5 mb-8">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" /> Enter EVC Plus Details
                    </h3>
                    <Input 
                      label="Mobile Number" 
                      placeholder="e.g. 061XXXXXXX" 
                      type="tel"
                      required 
                      value={evcNumber} 
                      onChange={(e) => setEvcNumber(e.target.value)}
                    />
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>Go Back</Button>
                  <Button type="submit" className="w-full sm:w-auto px-8" disabled={loading}>
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-[var(--color-border)]">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-4">
                  <img src={item.images[0] || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded border border-gray-800" />
                  <div className="flex-1">
                    <h4 className="text-sm text-white line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.qty}</p>
                    <p className="text-sm font-semibold text-white mt-1">${(item.price * item.qty).toLocaleString('en-US')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>${itemsPrice.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Tax (5%)</span>
                <span>${taxPrice.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toLocaleString('en-US')}`}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span>${totalPrice.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
