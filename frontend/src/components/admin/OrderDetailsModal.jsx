import React from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatter';

const Field = ({ label, value }) => (
  <p className="text-sm"><span className="text-muted">{label}:</span> <span className="text-fg font-medium">{value}</span></p>
);

const OrderDetailsModal = ({ order, onClose, onPay, onDeliver, onCancel }) => {
  const canPay = !order.isPaid && order.status !== 'Cancelled';
  const canDeliver = !order.isDelivered && order.status !== 'Cancelled';
  const canCancel = order.status !== 'Cancelled' && order.status !== 'Delivered';

  return (
  <Modal
    title="Order Details"
    onClose={onClose}
    footer={
      <>
        {canCancel && <Button variant="ghost" className="text-danger" onClick={onCancel}>Cancel Order</Button>}
        {canPay && <Button variant="secondary" onClick={onPay}>Mark Paid</Button>}
        {canDeliver && <Button onClick={onDeliver}>Mark Delivered</Button>}
        {!canPay && !canDeliver && !canCancel && <Button onClick={onClose}>Close</Button>}
      </>
    }
  >
    <div className="p-5 sm:p-6 space-y-6 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <h3 className="text-muted text-xs uppercase tracking-wider mb-2 font-semibold">Customer</h3>
          <Field label="Name" value={order.user?.name || 'Unknown'} />
          <Field label="Email" value={order.user?.email || 'Unknown'} />
          <p className="text-xs text-muted mt-2 break-all">ID: {order._id}</p>
          <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-muted text-xs uppercase tracking-wider mb-2 font-semibold">Shipping Address</h3>
          <Field label="Street" value={order.shippingAddress?.streetName} />
          <Field label="City" value={order.shippingAddress?.city} />
          <Field label="District" value={order.shippingAddress?.district} />
          <Field label="Landmark" value={order.shippingAddress?.landmark} />
        </div>
      </div>

      <div className="border border-line rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-2 text-muted text-xs uppercase">
            <tr><th className="p-3">Item</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {order.orderItems?.map((item) => (
              <tr key={item._id || item.product}>
                <td className="p-3 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-line" />
                  <span className="text-fg">{item.name}</span>
                </td>
                <td className="p-3 text-center text-fg">{item.qty}</td>
                <td className="p-3 text-right text-fg">{formatCurrency(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 border-t border-line pt-4">
        <div className="space-y-1">
          <Field label="Payment" value={order.paymentMethod} />
          <p className="text-sm">
            <span className="text-muted">Paid:</span>{' '}
            {order.isPaid
              ? <span className="text-success font-medium">Yes ({new Date(order.paidAt).toLocaleDateString()})</span>
              : <span className="text-danger">Not paid</span>}
          </p>
          <p className="text-sm">
            <span className="text-muted">Delivered:</span>{' '}
            {order.isDelivered
              ? <span className="text-success font-medium">Yes ({new Date(order.deliveredAt).toLocaleDateString()})</span>
              : <span className="text-danger">Pending</span>}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-muted">Items: <span className="text-fg">{formatCurrency(order.itemsPrice)}</span></p>
          <p className="text-muted">Shipping: <span className="text-fg">{formatCurrency(order.shippingPrice)}</span></p>
          <p className="text-xs text-muted">Tax: {formatCurrency(order.taxPrice)}</p>
          <p className="text-xl font-bold text-primary">Total: {formatCurrency(order.totalPrice)}</p>
        </div>
      </div>
    </div>
  </Modal>
  );
};

export default OrderDetailsModal;
