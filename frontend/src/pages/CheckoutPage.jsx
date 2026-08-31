import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Check, CreditCard, Banknote, Smartphone,
  ShieldCheck, Loader2, XCircle, MapPin, ArrowLeft, ArrowRight, Package,
} from 'lucide-react';
import { clearCart } from '../redux/slices/cartSlice';
import { createOrder, payOrder, resetOrder } from '../redux/slices/orderSlice';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatter';
import { somaliCities, districtsFor } from '../data/somaliLocations';
import api from '../utils/api';

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
];

const CheckoutPage = () => {
  const { cartItems } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.auth);
  const { error, loading } = useSelector((s) => s.order);
  const { freeShippingThreshold } = useSelector((s) => s.settings);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ streetName: '', city: '', district: '', landmark: '' });
  const [paymentMethod, setPaymentMethod] = useState('EVC Plus');
  const [evcNumber, setEvcNumber] = useState('');
  const [evcPin, setEvcPin] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const [evcStatus, setEvcStatus] = useState('idle'); // idle | pushing | confirming
  const [evcError, setEvcError] = useState('');

  const itemCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const itemsPrice = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : 15;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  const toFreeShipping = Math.max(freeShippingThreshold - itemsPrice, 0);

  useEffect(() => {
    if (!userInfo) navigate('/login?redirect=/checkout');
    else if (userInfo.role?.toLowerCase() === 'admin') navigate('/dashboard');
  }, [userInfo, navigate]);

  useEffect(() => {
    if (placedOrder) {
      dispatch(clearCart());
      dispatch(resetOrder());
    }
  }, [placedOrder, dispatch]);

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full flex-grow px-4">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-muted" />
        </div>
        <h2 className="text-xl font-bold text-fg mb-2">Your cart is empty</h2>
        <p className="text-muted text-sm mb-6">Add something from the shop to check out.</p>
        <Button onClick={() => navigate('/shop')}>Browse Products</Button>
      </div>
    );
  }

  const buildOrderData = () => ({
    orderItems: cartItems.map((i) => ({ name: i.name, qty: i.qty, image: i.images[0], price: i.price, product: i._id })),
    shippingAddress: { ...shipping },
    paymentMethod,
    itemsPrice, shippingPrice, taxPrice, totalPrice,
  });

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setEvcError('');

    if (paymentMethod !== 'EVC Plus') {
      const res = await dispatch(createOrder(buildOrderData()));
      if (createOrder.fulfilled.match(res)) setPlacedOrder(res.payload);
      return;
    }

    try {
      setEvcStatus('pushing');
      const { data } = await api.post('/payment/evcplus', { phoneNumber: evcNumber, amount: totalPrice, pin: evcPin });

      setEvcStatus('confirming');
      const res = await dispatch(createOrder(buildOrderData()));
      if (!createOrder.fulfilled.match(res)) {
        setEvcStatus('idle');
        setEvcError(res.payload || 'Could not create your order.');
        return;
      }

      const order = res.payload;
      await dispatch(payOrder({
        id: order._id,
        paymentResult: {
          transactionId: data?.params?.transactionId || 'EVC-UNKNOWN',
          status: data?.state === 'APPROVED' ? 'COMPLETED' : (data?.state || 'COMPLETED'),
          update_time: data?.params?.timestamp || new Date().toISOString(),
          payer_phone: data?.params?.accountNo || evcNumber,
        },
      }));

      setEvcStatus('idle');
      setPlacedOrder(order);
    } catch (err) {
      setEvcStatus('idle');
      if (err.response?.data?.message) setEvcError(err.response.data.message);
      else if (err.response) setEvcError(`Server error (${err.response.status}). Please try again.`);
      else setEvcError('Could not reach the payment service. Make sure the backend is running.');
    }
  };

  /* ── Success ─────────────────────────────── */
  if (placedOrder) {
    const ref = `#${String(placedOrder._id).slice(-8).toUpperCase()}`;
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center w-full flex-grow px-4">
        <div className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-fg mb-2">Order placed</h2>
        <p className="text-muted mb-1">Order <span className="font-semibold text-fg">{ref}</span> · {formatCurrency(placedOrder.totalPrice)}</p>
        <p className="text-muted text-sm mb-8 max-w-md">
          {placedOrder.isPaid ? 'Payment received.' : 'Pay on delivery.'} We've emailed you a confirmation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/order/${placedOrder._id}`}><Button className="w-full sm:w-auto">View Order</Button></Link>
          <Link to="/shop"><Button variant="secondary" className="w-full sm:w-auto">Continue Shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-grow">

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done ? 'bg-primary text-on-primary' : active ? 'bg-primary/15 text-primary border border-primary' : 'bg-surface-2 text-muted border border-line'
                }`}>
                  {done ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                <span className={`text-sm font-medium ${active || done ? 'text-fg' : 'text-muted'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-8 sm:w-16 ${step > s.id ? 'bg-primary' : 'bg-line'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

        {/* Left: forms */}
        <div className="md:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7">
              <h2 className="text-xl font-bold text-fg mb-1">Delivery address</h2>
              <p className="text-sm text-muted mb-6">Where should we send <span className="text-fg font-medium">{userInfo?.name}</span>'s order?</p>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="City"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value, district: '' })}
                  >
                    <option value="" disabled>Select a city</option>
                    {somaliCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  <Select
                    label="District"
                    required
                    disabled={!shipping.city}
                    value={shipping.district}
                    onChange={(e) => setShipping({ ...shipping, district: e.target.value })}
                  >
                    <option value="" disabled>{shipping.city ? 'Select a district' : 'Choose a city first'}</option>
                    {districtsFor(shipping.city).map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <Input label="Street Name" required value={shipping.streetName} onChange={(e) => setShipping({ ...shipping, streetName: e.target.value })} />
                <Input label="Nearest Landmark" placeholder="Near Masjidka Isbaheysiga…" required value={shipping.landmark} onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })} />
                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    Continue to Payment <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="relative bg-surface border border-line rounded-2xl p-5 sm:p-7">
              <h2 className="text-xl font-bold text-fg mb-6">Payment method</h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-3">
                  <PaymentOption
                    selected={paymentMethod === 'EVC Plus'}
                    onSelect={() => setPaymentMethod('EVC Plus')}
                    icon={Smartphone}
                    tone="bg-primary/15 text-primary"
                    title="EVC Plus"
                    subtitle="Mobile money. Pay now from your phone"
                  />
                  <PaymentOption
                    selected={paymentMethod === 'Cash on Delivery'}
                    onSelect={() => setPaymentMethod('Cash on Delivery')}
                    icon={Banknote}
                    tone="bg-success/15 text-success"
                    title="Cash on Delivery"
                    subtitle="Pay the courier when your order arrives"
                  />
                </div>

                {paymentMethod === 'EVC Plus' && (
                  <div className="bg-canvas border border-line rounded-xl p-4 sm:p-5 space-y-1">
                    <Input
                      label="EVC Plus Number"
                      placeholder="0619XXXXXX"
                      type="tel"
                      required
                      value={evcNumber}
                      onChange={(e) => setEvcNumber(e.target.value)}
                    />
                    <Input
                      label="PIN"
                      placeholder="4-digit PIN"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={evcPin}
                      onChange={(e) => setEvcPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-[11px] text-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                      Simulated gateway. Demo PIN is <span className="font-mono text-fg">1234</span>.
                    </p>
                  </div>
                )}

                {(evcError || error) && (
                  <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{evcError || error}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2 border-t border-line">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading || evcStatus !== 'idle'} className="flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button type="submit" className="px-8" disabled={loading || evcStatus !== 'idle'}>
                    {evcStatus === 'pushing' ? 'Sending request…'
                      : evcStatus === 'confirming' ? 'Confirming…'
                      : loading ? 'Processing…'
                      : `Pay ${formatCurrency(totalPrice)}`}
                  </Button>
                </div>
              </form>

              {evcStatus !== 'idle' && (
                <div className="absolute inset-0 bg-canvas/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-8 z-20">
                  <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                  <h3 className="text-fg font-bold text-lg mb-1">
                    {evcStatus === 'pushing' ? 'Check your phone' : 'Finalising your order'}
                  </h3>
                  <p className="text-muted text-sm max-w-xs">
                    {evcStatus === 'pushing'
                      ? `A ${formatCurrency(totalPrice)} request was sent to ${evcNumber}. Approve it with your PIN.`
                      : 'Payment approved. Creating your order.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="md:col-span-1">
          <div className="bg-surface border border-line rounded-2xl p-5 md:sticky md:top-24">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-line">
              <h2 className="text-base font-bold text-fg">Order Summary</h2>
              <span className="text-xs text-muted">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-3 mb-5 max-h-64 overflow-y-auto scrollbar-hide">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img src={item.images[0] || '/placeholder.jpg'} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-line" />
                    <span className="absolute -top-1.5 -right-1.5 bg-surface-2 border border-line text-fg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-fg line-clamp-2 leading-snug">{item.name}</h4>
                    <p className="text-sm font-semibold text-fg mt-1">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {toFreeShipping > 0 && (
              <p className="text-[11px] text-muted bg-surface-2 rounded-lg px-3 py-2 mb-4">
                Add <span className="text-fg font-semibold">{formatCurrency(toFreeShipping)}</span> more for free delivery.
              </p>
            )}

            <div className="border-t border-line pt-4 space-y-2.5">
              <Row label="Subtotal" value={formatCurrency(itemsPrice)} />
              <Row label="Tax (5%)" value={formatCurrency(taxPrice)} />
              <Row label="Shipping" value={shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)} highlight={shippingPrice === 0} />
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

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted">{label}</span>
    <span className={highlight ? 'text-success font-semibold' : 'text-fg'}>{value}</span>
  </div>
);

const PaymentOption = ({ selected, onSelect, icon: Icon, tone, title, subtitle }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
      selected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-line hover:bg-surface-2'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-fg">{title}</h3>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-primary bg-primary text-on-primary' : 'border-line'}`}>
      {selected && <Check size={12} />}
    </div>
  </button>
);

export default CheckoutPage;
