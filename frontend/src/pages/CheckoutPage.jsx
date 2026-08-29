import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CreditCard, Banknote, Smartphone, ShieldCheck, Loader2, XCircle } from 'lucide-react';
import { clearCart } from '../redux/slices/cartSlice';
import { createOrder, payOrder, resetOrder } from '../redux/slices/orderSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useEffect } from 'react';
import { formatCurrency } from '../utils/formatter';
import api from '../utils/api';

const CheckoutPage = () => {
  const { cartItems } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);
  const { error, loading } = useSelector(state => state.order);
  const { freeShippingThreshold } = useSelector(state => state.settings);
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
  const [evcPin, setEvcPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // EVC Plus gateway flow: idle -> pushing -> confirming
  const [evcStatus, setEvcStatus] = useState('idle');
  const [evcError, setEvcError] = useState('');

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : 15;
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
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center w-full flex-grow px-4">
        <h2 className="text-2xl font-bold text-fg mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const buildOrderData = () => ({
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
  });

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setEvcError('');

    // Cash on Delivery: just place the order, no gateway.
    if (paymentMethod !== 'EVC Plus') {
      const resultAction = await dispatch(createOrder(buildOrderData()));
      if (createOrder.fulfilled.match(resultAction)) setIsSuccess(true);
      return;
    }

    // EVC Plus: run the payment gateway FIRST, only create the order once it clears.
    try {
      setEvcStatus('pushing');
      const { data } = await api.post('/payment/evcplus', {
        phoneNumber: evcNumber,
        amount: totalPrice,
        pin: evcPin,
      });

      setEvcStatus('confirming');
      const resultAction = await dispatch(createOrder(buildOrderData()));
      if (!createOrder.fulfilled.match(resultAction)) {
        setEvcStatus('idle');
        setEvcError(resultAction.payload || 'Order-ka lama abuuri karin.');
        return;
      }

      const createdOrder = resultAction.payload;
      const paymentResult = {
        transactionId: data?.params?.transactionId || 'EVC-UNKNOWN',
        status: data?.state === 'APPROVED' ? 'COMPLETED' : (data?.state || 'COMPLETED'),
        update_time: data?.params?.timestamp || new Date().toISOString(),
        payer_phone: data?.params?.accountNo || evcNumber,
      };
      await dispatch(payOrder({ id: createdOrder._id, paymentResult }));

      setEvcStatus('idle');
      setIsSuccess(true);
    } catch (err) {
      setEvcStatus('idle');
      if (err.response?.data?.message) {
        // The gateway responded with a decline (wrong PIN, no funds, declined...)
        setEvcError(err.response.data.message);
      } else if (err.response) {
        setEvcError(`Khalad server ah (${err.response.status}). Fadlan mar kale isku day.`);
      } else {
        // No response at all — backend unreachable / proxy down
        setEvcError('Lama gaari karo server-ka lacag bixinta. Hubi in backend-ku shaqeynayo.');
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center w-full flex-grow px-4">
        <div className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-fg mb-4">Order Placed Successfully!</h2>
        <p className="text-muted mb-8 max-w-md">
          Thank you for your purchase. Your order has been placed and is being processed.
          You will receive an email confirmation shortly.
        </p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-grow">

      {/* Checkout Steps Indicator */}
      <div className="flex items-center justify-center mb-8 sm:mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 1 ? 'bg-primary/20 border border-primary' : 'bg-surface-2 border border-line'}`}>
            1
          </div>
          <span className="font-medium hidden sm:inline">Shipping</span>
        </div>
        <ChevronRight className="w-5 h-5 mx-2 md:mx-4 text-muted" />
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 2 ? 'bg-primary/20 border border-primary' : 'bg-surface-2 border border-line'}`}>
            2
          </div>
          <span className="font-medium hidden sm:inline">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

        {/* Forms */}
        <div className="md:col-span-2">
          {step === 1 && (
            <div className="bg-surface border border-line rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-fg mb-6">Shipping Details</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  required
                  value={shipping.fullName}
                  onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="e.g. Muqdisho, Hargeisa"
                    required
                    value={shipping.city}
                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                  />
                  <Input
                    label="District"
                    placeholder="e.g. Hodan, Karan"
                    required
                    value={shipping.district}
                    onChange={e => setShipping({ ...shipping, district: e.target.value })}
                  />
                </div>

                <Input
                  label="Street Name"
                  required
                  value={shipping.streetName}
                  onChange={e => setShipping({ ...shipping, streetName: e.target.value })}
                />

                <Input
                  label="Nearest Landmark"
                  placeholder="e.g. Near Masjidka Isbaheysiga"
                  required
                  value={shipping.landmark}
                  onChange={e => setShipping({ ...shipping, landmark: e.target.value })}
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">Continue to Payment</Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="relative bg-surface border border-line rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-fg mb-6">Payment Method</h2>
              <form onSubmit={handlePaymentSubmit}>

                <div className="space-y-4 mb-8">
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'EVC Plus' ? 'border-primary bg-primary/5' : 'border-line bg-surface hover:bg-surface-2'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="EVC Plus"
                      checked={paymentMethod === 'EVC Plus'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-primary"
                    />
                    <div className="w-10 h-10 bg-primary/15 text-primary rounded-full flex items-center justify-center border border-primary/30">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fg">EVC Plus</h3>
                      <p className="text-sm text-muted">Mobile Money Payment</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-line bg-surface hover:bg-surface-2'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-primary"
                    />
                    <div className="w-10 h-10 bg-success/15 text-success rounded-full flex items-center justify-center border border-success/30">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fg">Cash on Delivery</h3>
                      <p className="text-sm text-muted">Pay when you receive</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'EVC Plus' && (
                  <div className="bg-canvas border border-line rounded-xl p-5 mb-8">
                    <h3 className="font-medium text-fg mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted" /> Enter EVC Plus Details
                    </h3>
                    <Input
                      label="Mobile Number"
                      placeholder="e.g. 0619XXXXXX"
                      type="tel"
                      required
                      value={evcNumber}
                      onChange={(e) => setEvcNumber(e.target.value)}
                    />
                    <Input
                      label="EVC Plus PIN"
                      placeholder="4-digit PIN"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={evcPin}
                      onChange={(e) => setEvcPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-[11px] text-muted flex items-center gap-1.5 -mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" />
                      Simulated gateway — demo PIN is <span className="text-muted font-mono">1234</span>.
                    </p>
                  </div>
                )}

                {(evcError || error) && (
                  <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{evcError || error}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-line">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading || evcStatus !== 'idle'}>Go Back</Button>
                  <Button type="submit" className="w-full sm:w-auto px-8" disabled={loading || evcStatus !== 'idle'}>
                    {evcStatus === 'pushing' ? 'Sending request...'
                      : evcStatus === 'confirming' ? 'Confirming payment...'
                      : loading ? 'Processing...'
                      : 'Place Order'}
                  </Button>
                </div>
              </form>

              {evcStatus !== 'idle' && (
                <div className="absolute inset-0 bg-canvas/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-8 z-20">
                  <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                  <h3 className="text-fg font-bold text-lg mb-1">
                    {evcStatus === 'pushing' ? 'Check your phone' : 'Finalising your order'}
                  </h3>
                  <p className="text-muted text-sm max-w-xs">
                    {evcStatus === 'pushing'
                      ? `A payment request for ${formatCurrency(totalPrice)} was sent to ${evcNumber}. Enter your EVC Plus PIN to approve.`
                      : 'Payment approved. Creating your order...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-surface border border-line rounded-xl p-6 md:sticky md:top-24">
            <h2 className="text-xl font-bold text-fg mb-6 pb-4 border-b border-line">Order Summary</h2>

            <div className="flex flex-col gap-4 mb-6">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-4">
                  <img src={item.images[0] || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded border border-line" />
                  <div className="flex-1">
                    <h4 className="text-sm text-fg line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted mt-1">Qty: {item.qty}</p>
                    <p className="text-sm font-semibold text-fg mt-1">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex justify-between text-muted text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Tax (5%)</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-fg font-bold text-lg pt-3 border-t border-line">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
