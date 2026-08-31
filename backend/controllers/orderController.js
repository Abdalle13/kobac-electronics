import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';
import { queueEmail } from '../utils/sendEmail.js';
import { orderConfirmationEmail, paymentReceivedEmail, orderDeliveredEmail } from '../utils/emailTemplates.js';

const TAX_RATE = 0.05;
const DEFAULT_SHIPPING_FEE = 15;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 400;
const PAYMENT_METHODS = ['EVC Plus', 'Cash on Delivery'];

// Installments ("qaybo") are only offered for EVC Plus orders above this total.
const INSTALLMENT_MIN_TOTAL = 150;
const INSTALLMENT_COUNTS = [2, 3, 4];

const isOwner = (order, user) => order.user.toString() === user._id.toString();
const isAdmin = (user) => user.role === 'Admin';
const round2 = (n) => Number(n.toFixed(2));

// Split `total` into `count` monthly installments (first one carries the rounding),
// starting one month from now.
const buildInstallments = (total, count) => {
  const base = round2(total / count);
  const first = round2(total - base * (count - 1));
  const out = [];
  for (let i = 0; i < count; i++) {
    const due = new Date();
    due.setMonth(due.getMonth() + i);
    out.push({ amount: i === 0 ? first : base, dueDate: due, paid: false });
  }
  return out;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, installments } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  const useInstallments = Boolean(installments);
  if (useInstallments) {
    if (paymentMethod !== 'EVC Plus') {
      res.status(400);
      throw new Error('Installments are only available with EVC Plus');
    }
    if (!INSTALLMENT_COUNTS.includes(Number(installments))) {
      res.status(400);
      throw new Error('Invalid installment count');
    }
  }

  // 1. Atomically reserve stock AND read the authoritative price/name from the DB.
  //    The { countInStock: { $gte: qty } } guard + $inc makes the check-and-decrement
  //    a single operation, so two concurrent orders can't both pass and oversell.
  const reserved = [];
  const pricedItems = [];

  const rollback = async () => {
    for (const r of reserved) {
      await Product.updateOne({ _id: r.product }, { $inc: { countInStock: r.qty } });
    }
  };

  for (const item of orderItems) {
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1) {
      await rollback();
      res.status(400);
      throw new Error(`Invalid quantity for ${item.name || 'an item'}`);
    }

    const updated = await Product.findOneAndUpdate(
      { _id: item.product, countInStock: { $gte: qty } },
      { $inc: { countInStock: -qty } },
      { new: true }
    );

    if (!updated) {
      await rollback();
      const exists = await Product.findById(item.product);
      res.status(exists ? 400 : 404);
      throw new Error(
        exists ? `Insufficient stock for ${exists.name}` : 'One or more products are no longer available'
      );
    }

    reserved.push({ product: updated._id, qty });
    pricedItems.push({
      name: updated.name,
      qty,
      image: updated.images?.[0] || item.image,
      price: updated.price, // authoritative — never trust the client
      cost: updated.costPrice || 0, // snapshot for profit reporting
      product: updated._id,
    });
  }

  // 2. Compute every monetary value server-side.
  const itemsPrice = Number(
    pricedItems.reduce((acc, i) => acc + i.price * i.qty, 0).toFixed(2)
  );

  let freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD;
  const settings = await Settings.findOne();
  if (settings && typeof settings.freeShippingThreshold === 'number') {
    freeShippingThreshold = settings.freeShippingThreshold;
  }

  const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : DEFAULT_SHIPPING_FEE;
  const taxPrice = Number((TAX_RATE * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  if (useInstallments && totalPrice < INSTALLMENT_MIN_TOTAL) {
    await rollback();
    res.status(400);
    throw new Error(`Installments need an order of at least $${INSTALLMENT_MIN_TOTAL}`);
  }

  const installmentPlan = useInstallments
    ? { enabled: true, installments: buildInstallments(totalPrice, Number(installments)) }
    : undefined;

  // 3. Persist (roll stock back if saving the order fails)
  let createdOrder;
  try {
    const order = new Order({
      orderItems: pricedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      ...(installmentPlan ? { installmentPlan } : {}),
    });
    createdOrder = await order.save();
  } catch (error) {
    await rollback();
    throw error;
  }

  // Send the confirmation email BEFORE responding — on serverless the function
  // can be frozen the instant the response is flushed. queueEmail never throws.
  const { subject, html } = orderConfirmationEmail(createdOrder, req.user);
  await queueEmail({ to: req.user.email, subject, html });

  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('delivery.rider', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && !isAdmin(req.user)) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private (owner only)
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (!isOwner(order, req.user)) {
      res.status(403);
      throw new Error('Not authorized to pay for this order');
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error('Order is already paid');
    }

    if (order.installmentPlan?.enabled) {
      res.status(400);
      throw new Error('This order is on a payment plan; pay each installment instead');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Paid';
    order.paymentResult = {
      transactionId: req.body.transactionId,
      status: req.body.status,
      update_time: req.body.update_time,
      payer_phone: req.body.payer_phone,
    };

    const updatedOrder = await order.save();

    const { subject, html } = paymentReceivedEmail(updatedOrder, req.user);
    await queueEmail({ to: req.user.email, subject, html });

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .populate('delivery.rider', 'name email');
  res.json(orders);
};

const DELIVERY_FLOW = ['Unassigned', 'Assigned', 'Picked Up', 'On the Way', 'Delivered'];

// @desc    Orders assigned to the logged-in rider
// @route   GET /api/orders/rider
// @access  Private/Rider
const getRiderOrders = async (req, res) => {
  const orders = await Order.find({ 'delivery.rider': req.user._id })
    .populate('user', 'name email')
    .sort({ 'delivery.assignedAt': -1 });
  res.json(orders);
};

// @desc    Assign a rider to an order
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin
const assignRider = async (req, res) => {
  const { riderId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  if (order.status === 'Cancelled') {
    res.status(400).json({ message: 'Cannot assign a cancelled order' });
    return;
  }

  const rider = riderId ? await User.findById(riderId) : null;
  if (riderId && (!rider || rider.role !== 'Rider')) {
    res.status(400).json({ message: 'That user is not a rider' });
    return;
  }

  if (!order.delivery) order.delivery = { status: 'Unassigned', events: [] };
  if (!Array.isArray(order.delivery.events)) order.delivery.events = [];
  order.delivery.rider = riderId || undefined;
  order.delivery.status = riderId ? 'Assigned' : 'Unassigned';
  order.delivery.assignedAt = riderId ? Date.now() : undefined;
  order.delivery.events.push({
    status: order.delivery.status,
    at: Date.now(),
    note: riderId ? `Assigned to ${rider.name}` : 'Rider unassigned',
  });

  await order.save();
  const updated = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('delivery.rider', 'name email');
  res.json(updated);
};

// @desc    Advance the delivery status of an order
// @route   PUT /api/orders/:id/delivery
// @access  Private (assigned rider or admin)
const updateDeliveryStatus = async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const admin = isAdmin(req.user);
  const isAssignedRider = order.delivery?.rider && order.delivery.rider.toString() === req.user._id.toString();
  if (!admin && !isAssignedRider) {
    res.status(403).json({ message: 'Not your delivery' });
    return;
  }

  if (!order.delivery) order.delivery = { status: 'Unassigned', events: [] };
  if (!Array.isArray(order.delivery.events)) order.delivery.events = [];
  const from = DELIVERY_FLOW.indexOf(order.delivery.status || 'Unassigned');
  const to = DELIVERY_FLOW.indexOf(status);
  if (to === -1) {
    res.status(400).json({ message: 'Invalid delivery status' });
    return;
  }
  if (to <= from) {
    res.status(400).json({ message: 'Delivery status can only move forward' });
    return;
  }
  if (from === 0) {
    res.status(400).json({ message: 'Assign a rider first' });
    return;
  }

  order.delivery.status = status;
  order.delivery.events.push({ status, at: Date.now(), note });

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
  }

  const updated = await order.save();
  res.json(updated);

  if (status === 'Delivered' && order.user?.email) {
    const { subject, html } = orderDeliveredEmail(updated, order.user);
    await queueEmail({ to: order.user.email, subject, html });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    if (order.user?.email) {
      const { subject, html } = orderDeliveredEmail(updatedOrder, order.user);
      await queueEmail({ to: order.user.email, subject, html });
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to paid (Admin manual)
// @route   PUT /api/orders/:id/payadmin
// @access  Private/Admin
const updateOrderToPaidAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Paid';
    order.paymentResult = {
      status: 'Manual',
      update_time: Date.now(),
    };

    const updatedOrder = await order.save();

    if (order.user?.email) {
      const { subject, html } = paymentReceivedEmail(updatedOrder, order.user);
      await queueEmail({ to: order.user.email, subject, html });
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Cancel order (owner or admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private (owner or admin)
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (!isOwner(order, req.user) && !isAdmin(req.user)) {
      res.status(403).json({ message: 'Not authorized to cancel this order' });
      return;
    }

    if (order.status === 'Cancelled') {
      res.status(400).json({ message: 'Order is already cancelled' });
      return;
    }

    if (order.status === 'Delivered') {
      res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
      return;
    }

    order.status = 'Cancelled';

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.qty;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Pay one installment of a payment plan
// @route   PUT /api/orders/:id/installments/:index/pay
// @access  Private (owner pays via EVC; admin can record a cash payment)
const payInstallment = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const admin = isAdmin(req.user);
  if (!admin && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'Not authorized to pay this order' });
    return;
  }

  if (!order.installmentPlan?.enabled) {
    res.status(400).json({ message: 'This order has no payment plan' });
    return;
  }
  if (order.status === 'Cancelled') {
    res.status(400).json({ message: 'Order is cancelled' });
    return;
  }

  const list = order.installmentPlan.installments;
  const index = Number(req.params.index);
  const target = list[index];

  if (!target) {
    res.status(404).json({ message: 'Installment not found' });
    return;
  }
  if (target.paid) {
    res.status(400).json({ message: 'That installment is already paid' });
    return;
  }
  // Installments must be paid in order
  const firstUnpaid = list.findIndex((i) => !i.paid);
  if (index !== firstUnpaid) {
    res.status(400).json({ message: 'Pay the earlier installments first' });
    return;
  }

  target.paid = true;
  target.paidAt = Date.now();
  target.method = admin ? 'Manual' : 'EVC Plus';
  target.reference = req.body.reference || req.body.transactionId || '';

  const allPaid = list.every((i) => i.paid);
  if (allPaid) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Paid';
    order.paymentResult = { status: 'Installments complete', update_time: String(Date.now()) };
  }

  const updated = await order.save();
  res.json(updated);

  if (allPaid && order.user?.email) {
    const { subject, html } = paymentReceivedEmail(updated, order.user);
    await queueEmail({ to: order.user.email, subject, html });
  }
};

// @desc    Get order summary (Lacagta/Finance)
// @route   GET /api/orders/summary
// @access  Private/Admin
const getOrderSummary = async (req, res) => {
  try {
    const orders = await Order.find({});

    const paidOrders = orders.filter((o) => o.isPaid);
    const totalSales = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);
    const numOrders = orders.length;
    const numPaidOrders = paidOrders.length;
    const avgOrderValue = numPaidOrders ? totalSales / numPaidOrders : 0;

    const evcSales = paidOrders
      .filter((o) => o.paymentMethod === 'EVC Plus')
      .reduce((acc, o) => acc + o.totalPrice, 0);

    const codSales = paidOrders
      .filter((o) => o.paymentMethod === 'Cash on Delivery')
      .reduce((acc, o) => acc + o.totalPrice, 0);

    // Profit on goods: item revenue minus the cost snapshot on each line
    const goodsRevenue = paidOrders.reduce(
      (acc, o) => acc + o.orderItems.reduce((s, i) => s + i.price * i.qty, 0),
      0
    );
    const goodsCost = paidOrders.reduce(
      (acc, o) => acc + o.orderItems.reduce((s, i) => s + (i.cost || 0) * i.qty, 0),
      0
    );
    const grossProfit = goodsRevenue - goodsCost;
    const profitMargin = goodsRevenue > 0 ? (grossProfit / goodsRevenue) * 100 : 0;

    // Order count by status
    const statusBreakdown = orders.reduce((acc, o) => {
      const s = o.status || 'Pending';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // Paid revenue this 7-day window vs the previous 7-day window
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const inWindow = (o, startDaysAgo, endDaysAgo) => {
      if (!o.paidAt) return false;
      const t = new Date(o.paidAt).getTime();
      return t >= now - startDaysAgo * day && t < now - endDaysAgo * day;
    };
    const sumIn = (a, b) => paidOrders.filter((o) => inWindow(o, a, b)).reduce((s, o) => s + o.totalPrice, 0);
    const countIn = (a, b) => paidOrders.filter((o) => inWindow(o, a, b)).length;
    const pctChange = (curr, prev) => (prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0);

    const salesTrend = pctChange(sumIn(7, 0), sumIn(14, 7));
    const ordersTrend = pctChange(countIn(7, 0), countIn(14, 7));

    // Group sales by day for a mini-chart/list (last 7 days)
    const salesByDay = orders
      .filter(o => o.isPaid && o.paidAt)
      .reduce((acc, o) => {
        const paidDate = new Date(o.paidAt);
        if (!isNaN(paidDate)) {
          const day = paidDate.toLocaleDateString();
          acc[day] = (acc[day] || 0) + o.totalPrice;
        }
        return acc;
      }, {});

    // Per-product units & revenue from paid orders, with each product's category
    const perProduct = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          units: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          cost: { $sum: { $multiply: [{ $ifNull: ['$orderItems.cost', 0] }, '$orderItems.qty'] } },
        },
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
      { $addFields: {
          category: { $ifNull: [{ $arrayElemAt: ['$p.category', 0] }, 'Other'] },
          profit: { $subtract: ['$revenue', '$cost'] },
      } },
      { $project: { p: 0 } },
      { $sort: { revenue: -1 } },
    ]);

    const topProducts = perProduct.slice(0, 8);

    const byCat = {};
    perProduct.forEach((p) => {
      byCat[p.category] = byCat[p.category] || { category: p.category, revenue: 0, units: 0 };
      byCat[p.category].revenue += p.revenue;
      byCat[p.category].units += p.units;
    });
    const salesByCategory = Object.values(byCat).sort((a, b) => b.revenue - a.revenue);

    res.json({
      totalSales,
      numOrders,
      numPaidOrders,
      avgOrderValue,
      evcSales,
      codSales,
      goodsRevenue,
      goodsCost,
      grossProfit,
      profitMargin,
      statusBreakdown,
      salesTrend,
      ordersTrend,
      salesByDay,
      topProducts,
      salesByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaidAdmin,
  cancelOrder,
  payInstallment,
  getRiderOrders,
  assignRider,
  updateDeliveryStatus,
  getOrderSummary
};
