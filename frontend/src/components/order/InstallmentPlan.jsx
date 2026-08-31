import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { payInstallment, getOrderDetails } from '../../redux/slices/orderSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatter';
import Input from '../ui/Input';
import Button from '../ui/Button';

const InstallmentPlan = ({ order }) => {
  const dispatch = useDispatch();
  const list = order.installmentPlan?.installments || [];
  const nextIndex = list.findIndex((i) => !i.paid);
  const paidCount = list.filter((i) => i.paid).length;
  const remaining = list.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pay = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { data } = await api.post('/payment/evcplus', {
        phoneNumber: phone,
        amount: list[nextIndex].amount,
        pin,
      });
      const res = await dispatch(
        payInstallment({ id: order._id, index: nextIndex, reference: data?.params?.transactionId || 'EVC' })
      );
      if (payInstallment.rejected.match(res)) {
        setErr(res.payload || 'Could not record the payment.');
      } else {
        setOpen(false);
        setPhone('');
        setPin('');
        dispatch(getOrderDetails(order._id));
      }
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Payment failed. Check the number and PIN.');
    } finally {
      setBusy(false);
    }
  };

  if (!order.installmentPlan?.enabled) return null;

  return (
    <div className="glass border border-line rounded-3xl p-5 sm:p-8">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-fg">Payment plan</h3>
        <span className="text-xs text-muted">{paidCount} of {list.length} paid</span>
      </div>
      <p className="text-sm text-muted mb-5">
        {order.isPaid ? 'Fully paid off.' : `${formatCurrency(remaining)} left over ${list.length - paidCount} payment${list.length - paidCount !== 1 ? 's' : ''}.`}
      </p>

      <div className="space-y-2 mb-5">
        {list.map((inst, i) => {
          const overdue = !inst.paid && new Date(inst.dueDate) < new Date();
          const isNext = i === nextIndex;
          return (
            <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 ${isNext ? 'border-primary/40 bg-primary/5' : 'border-line'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                inst.paid ? 'bg-success text-white' : overdue ? 'bg-danger/15 text-danger' : 'bg-surface-2 text-muted'
              }`}>
                {inst.paid ? <Check size={13} /> : overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg">{formatCurrency(inst.amount)}</p>
                <p className="text-[11px] text-muted">
                  {inst.paid
                    ? `Paid ${new Date(inst.paidAt).toLocaleDateString()}`
                    : `Due ${new Date(inst.dueDate).toLocaleDateString()}`}
                  {overdue && <span className="text-danger"> · overdue</span>}
                </p>
              </div>
              {isNext && !open && (
                <Button className="text-xs px-3 py-1.5" onClick={() => setOpen(true)}>Pay now</Button>
              )}
            </div>
          );
        })}
      </div>

      {open && nextIndex > -1 && (
        <form onSubmit={pay} className="bg-canvas border border-line rounded-xl p-4 space-y-1">
          <Input label="EVC Plus Number" type="tel" placeholder="0619XXXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="PIN" type="password" inputMode="numeric" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
          <p className="text-[11px] text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" /> Simulated gateway. Demo PIN is <span className="font-mono text-fg">1234</span>.
          </p>
          {err && <p className="text-xs text-danger pt-1">{err}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" className="text-xs flex-1" disabled={busy}>
              {busy ? 'Processing…' : `Pay ${formatCurrency(list[nextIndex].amount)}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InstallmentPlan;
