import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Settings from '../models/settingsModel.js';
import { queueEmail } from '../utils/sendEmail.js';
import { orderConfirmationEmail, paymentReceivedEmail, orderDeliveredEmail } from '../utils/emailTemplates.js';

const TAX_RATE = 0.05;
const DEFAULT_SHIPPING_FEE = 15;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 400;
const PAYMENT_METHODS = ['EVC Plus', 'Cash on Delivery'];

const isOwner = (order, user) => order.user.toString() === user._id.toString();
const isAdmin = (user) => user.role === 'Admin';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
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
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

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
  const orders = await Order.find({}).populate('user', 'id name email');
  res.json(orders);
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
        },
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
      { $addFields: { category: { $ifNull: [{ $arrayElemAt: ['$p.category', 0] }, 'Other'] } } },
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
  getOrderSummary
};
