/*
 * Additive demo-data seeder for the Kobac Electronics portfolio DB.
 *
 *   node scripts/seedDemo.js           → add demo products, Somali customers and orders
 *   node scripts/seedDemo.js --reviews → add product reviews from customers who ordered
 *   node scripts/seedDemo.js --check   → just print what is currently in the database
 *
 * It NEVER deletes anything. Running it twice will add a second batch, so run once.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

dotenv.config();

const TAX_RATE = 0.05;
const SHIPPING_FEE = 15;
const FREE_SHIPPING_THRESHOLD = 400;
const IMG = (cat) => `/images/${cat.toLowerCase()}.png`;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const round2 = (n) => Number(n.toFixed(2));

// ── Demo catalogue (balanced across all 7 categories) ─────────────
const demoProducts = [
  // Phones
  { name: 'iPhone 15', brand: 'Apple', category: 'Phone', price: 899, countInStock: 25, description: 'A16 Bionic, 48MP camera and USB-C in a light aluminium body.', technicalSpecs: { ram: '6GB', storage: '128GB', processor: 'A16 Bionic' } },
  { name: 'Samsung Galaxy A55', brand: 'Samsung', category: 'Phone', price: 429, countInStock: 40, description: 'Mid-range all-rounder with a bright AMOLED screen and long battery life.', technicalSpecs: { ram: '8GB', storage: '256GB', processor: 'Exynos 1480' } },
  { name: 'Xiaomi Redmi Note 13 Pro', brand: 'Xiaomi', category: 'Phone', price: 329, countInStock: 50, description: 'Big 120Hz display, 200MP camera and 67W fast charging.', technicalSpecs: { ram: '8GB', storage: '256GB', processor: 'Snapdragon 7s Gen 2' } },
  { name: 'Tecno Camon 20', brand: 'Tecno', category: 'Phone', price: 189, countInStock: 60, description: 'Popular choice locally: large screen, dependable battery, low price.', technicalSpecs: { ram: '8GB', storage: '256GB', processor: 'Helio G85' } },
  { name: 'Google Pixel 7a', brand: 'Google', category: 'Phone', price: 419, countInStock: 15, description: 'Clean Android and the best point-and-shoot camera in its class.', technicalSpecs: { ram: '8GB', storage: '128GB', processor: 'Google Tensor G2' } },

  // Laptops
  { name: 'MacBook Air 13 M2', brand: 'Apple', category: 'Laptop', price: 1099, countInStock: 12, description: 'Silent, fanless and thin with all-day battery life.', technicalSpecs: { ram: '8GB', storage: '256GB SSD', processor: 'Apple M2' } },
  { name: 'Dell XPS 13', brand: 'Dell', category: 'Laptop', price: 1199, countInStock: 10, description: 'Compact premium Windows ultrabook with a stunning display.', technicalSpecs: { ram: '16GB', storage: '512GB SSD', processor: 'Intel Core i7' } },
  { name: 'HP Pavilion 15', brand: 'HP', category: 'Laptop', price: 649, countInStock: 22, description: 'Reliable everyday laptop for study and office work.', technicalSpecs: { ram: '16GB', storage: '512GB SSD', processor: 'Intel Core i5' } },
  { name: 'Lenovo IdeaPad Slim 3', brand: 'Lenovo', category: 'Laptop', price: 499, countInStock: 28, description: 'Affordable and light, good for browsing and documents.', technicalSpecs: { ram: '8GB', storage: '256GB SSD', processor: 'AMD Ryzen 5' } },

  // Tablets
  { name: 'iPad 10th Gen', brand: 'Apple', category: 'Tablet', price: 449, countInStock: 20, description: 'Colourful 10.9-inch iPad for browsing, notes and video.', technicalSpecs: { ram: '4GB', storage: '64GB', processor: 'A14 Bionic' } },
  { name: 'Samsung Galaxy Tab S9 FE', brand: 'Samsung', category: 'Tablet', price: 479, countInStock: 15, description: 'Water-resistant Android tablet that ships with the S Pen.', technicalSpecs: { ram: '6GB', storage: '128GB', processor: 'Exynos 1380' } },
  { name: 'Xiaomi Pad 6', brand: 'Xiaomi', category: 'Tablet', price: 329, countInStock: 18, description: 'Fast 144Hz display, great for media and light work.', technicalSpecs: { ram: '6GB', storage: '128GB', processor: 'Snapdragon 870' } },

  // Watches
  { name: 'Apple Watch SE 2', brand: 'Apple', category: 'Watch', price: 249, countInStock: 30, description: 'Core Apple Watch features: fitness, notifications and safety.', technicalSpecs: { storage: '32GB' } },
  { name: 'Samsung Galaxy Watch 6', brand: 'Samsung', category: 'Watch', price: 299, countInStock: 20, description: 'Sleek Wear OS watch with sleep and heart-rate tracking.', technicalSpecs: { storage: '16GB' } },
  { name: 'Amazfit GTR 4', brand: 'Amazfit', category: 'Watch', price: 169, countInStock: 28, description: 'Long battery life, built-in GPS and 150+ sport modes.', technicalSpecs: { storage: '2.3GB' } },

  // Headphones
  { name: 'AirPods Pro 2', brand: 'Apple', category: 'Headphones', price: 229, countInStock: 40, description: 'Active noise cancellation and Adaptive Audio with USB-C case.', technicalSpecs: {} },
  { name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Headphones', price: 349, countInStock: 15, description: 'Class-leading noise cancellation and 30-hour battery.', technicalSpecs: {} },
  { name: 'JBL Tune 770NC', brand: 'JBL', category: 'Headphones', price: 129, countInStock: 45, description: 'Punchy bass, noise cancelling and a huge 70-hour battery.', technicalSpecs: {} },

  // Gaming
  { name: 'PlayStation 5 Slim', brand: 'Sony', category: 'Gaming', price: 549, countInStock: 8, description: 'Next-gen console with lightning-fast SSD loading.', technicalSpecs: { storage: '1TB SSD' } },
  { name: 'Nintendo Switch OLED', brand: 'Nintendo', category: 'Gaming', price: 349, countInStock: 14, description: 'Vivid 7-inch OLED screen for handheld and docked play.', technicalSpecs: { storage: '64GB' } },

  // Accessories
  { name: 'Anker 20000mAh Power Bank', brand: 'Anker', category: 'Accessories', price: 45, countInStock: 70, description: 'Two-device fast charging, perfect for load-shedding days.', technicalSpecs: {} },
  { name: 'Anker 65W GaN Charger', brand: 'Anker', category: 'Accessories', price: 39, countInStock: 60, description: 'Small charger that powers a phone, tablet or laptop.', technicalSpecs: {} },
];

// ── Somali customers ─────────────────────────────────────────────
const somaliCustomers = [
  { name: 'Cabdiraxmaan Yuusuf', email: 'cabdiraxmaan.yuusuf@gmail.com' },
  { name: 'Faadumo Maxamed', email: 'faadumo.maxamed@gmail.com' },
  { name: 'Maxamed Cali', email: 'maxamed.cali@gmail.com' },
  { name: 'Khadiijo Warsame', email: 'khadiijo.warsame@gmail.com' },
  { name: 'Cabdullahi Xasan', email: 'cabdullahi.xasan@gmail.com' },
  { name: 'Hodan Ibraahim', email: 'hodan.ibraahim@gmail.com' },
  { name: 'Yuusuf Cabdi', email: 'yuusuf.cabdi@gmail.com' },
  { name: 'Ubax Siciid', email: 'ubax.siciid@gmail.com' },
  { name: 'Ismaaciil Cumar', email: 'ismaaciil.cumar@gmail.com' },
  { name: 'Naima Axmed', email: 'naima.axmed@gmail.com' },
  { name: 'Cali Nuur', email: 'cali.nuur@gmail.com' },
  { name: 'Sagal Maxamuud', email: 'sagal.maxamuud@gmail.com' },
  { name: 'Maxamuud Daahir', email: 'maxamuud.daahir@gmail.com' },
  { name: 'Deeqa Faarax', email: 'deeqa.faarax@gmail.com' },
  { name: 'Axmed Gele', email: 'axmed.gele@gmail.com' },
];

const districts = ['Hodan', 'Waberi', 'Hamar Weyne', 'Kaxda', 'Yaaqshiid', 'Wardhiigleey', 'Dharkenley', 'Boondheere'];
const landmarks = ['near Bakaaraha', 'opposite Jaamacadda', 'behind the mosque', 'next to the pharmacy', 'near the KM4 junction', 'by the water tower'];
const streets = ['Wadada 1-ka', 'Jidka Sodonka', 'Wadada Maka Al-Mukarama', 'Jidka Warshadaha', 'Wadada Afgooye'];

const REVIEW_COMMENTS = {
  5: [
    'Exactly what I wanted, works perfectly.',
    'Fast delivery to Mogadishu and the item was sealed and genuine.',
    'Great price and quality. Very happy with the purchase.',
    'Been using it for a week now with no problems at all.',
    'Original product, battery life is excellent.',
    'Smooth EVC Plus payment and quick delivery. Recommended.',
    'Better than I expected. Will buy from Kobac again.',
  ],
  4: [
    'Good product overall, the packaging could be better.',
    'Works well, delivery took a little longer than expected.',
    'Happy with it, just wish it came with a case.',
    'Solid choice for the price. Small scratch on the box.',
    'Does the job and setup was easy.',
  ],
  3: [
    'It is okay, nothing special for the price.',
    'Average. Delivery was slow but the item itself is fine.',
    'Works but the charger gets a bit hot.',
    'Decent product, I expected a little more.',
  ],
};

const recalcRating = (product) => {
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length
    ? round2(product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length)
    : 0;
};

async function seedReviews() {
  const orders = await Order.find({ status: { $ne: 'Cancelled' } }).populate('user', 'name');
  if (!orders.length) {
    console.log('No orders to base reviews on. Run without --reviews first.');
    return;
  }

  // user -> { name, productIds: Set, earliest order date per product }
  const byUser = new Map();
  for (const o of orders) {
    if (!o.user) continue;
    const entry = byUser.get(o.user._id.toString()) || { name: o.user.name, id: o.user._id, items: new Map() };
    for (const it of o.orderItems) {
      const pid = it.product.toString();
      const when = new Date((o.paidAt || o.createdAt).getTime() + rand(2, 10) * 86400000);
      if (!entry.items.has(pid) || when < entry.items.get(pid)) entry.items.set(pid, when);
    }
    byUser.set(o.user._id.toString(), entry);
  }

  const touched = new Map(); // productId -> product doc
  let added = 0;

  for (const [, u] of byUser) {
    for (const [pid, when] of u.items) {
      if (Math.random() > 0.5) continue; // only some purchases get reviewed
      let product = touched.get(pid) || (await Product.findById(pid));
      if (!product) continue;
      touched.set(pid, product);

      if (product.reviews.some((r) => r.user.toString() === u.id.toString())) continue;

      // rating skewed positive: mostly 4-5, occasional 3
      const rating = Math.random() < 0.6 ? 5 : Math.random() < 0.8 ? 4 : 3;
      product.reviews.push({
        user: u.id,
        name: u.name,
        rating,
        comment: pick(REVIEW_COMMENTS[rating]),
        createdAt: when,
        updatedAt: when,
      });
      added++;
    }
  }

  for (const product of touched.values()) {
    recalcRating(product);
    await product.save();
  }

  console.log(`Added ${added} reviews across ${touched.size} products`);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existingProducts = await Product.countDocuments();
  const existingUsers = await User.countDocuments();
  const existingOrders = await Order.countDocuments();
  console.log(`\nCurrent DB → ${existingProducts} products, ${existingUsers} users, ${existingOrders} orders`);

  if (process.argv.includes('--check')) {
    await mongoose.disconnect();
    return;
  }

  if (process.argv.includes('--reviews')) {
    await seedReviews();
    await mongoose.disconnect();
    return;
  }

  const admin = await User.findOne({ role: 'Admin' });
  if (!admin) throw new Error('No admin user found - cannot attribute products.');

  // 1. Products (skip any whose name already exists)
  const have = new Set((await Product.find({}, 'name')).map((p) => p.name));
  const toInsert = demoProducts
    .filter((p) => !have.has(p.name))
    .map((p) => ({ ...p, images: [IMG(p.category)], user: admin._id, rating: 0, numReviews: 0, reviews: [] }));
  const insertedProducts = toInsert.length ? await Product.insertMany(toInsert) : [];
  console.log(`Added ${insertedProducts.length} products`);

  // 2. Somali customers (skip existing emails)
  const createdUsers = [];
  for (const c of somaliCustomers) {
    if (await User.findOne({ email: c.email })) continue;
    createdUsers.push(await User.create({ ...c, password: 'password123', role: 'Customer' }));
  }
  console.log(`Added ${createdUsers.length} Somali customers`);

  // 3. Orders — spread over the last ~35 days, mixed payment + status
  const buyers = createdUsers.length ? createdUsers : await User.find({ role: 'Customer' }).limit(15);
  const catalogue = await Product.find({ countInStock: { $gt: 0 } });
  if (!buyers.length || !catalogue.length) {
    console.log('No buyers or sellable products available - skipping orders.');
    await mongoose.disconnect();
    return;
  }

  const ORDERS = 30;
  let paidCount = 0, cod = 0, evc = 0, delivered = 0, cancelled = 0, pending = 0;

  for (let i = 0; i < ORDERS; i++) {
    const buyer = pick(buyers);
    const lineCount = rand(1, 3);
    const chosen = [];
    const used = new Set();
    for (let l = 0; l < lineCount; l++) {
      const prod = pick(catalogue);
      if (used.has(prod._id.toString())) continue;
      used.add(prod._id.toString());
      const qty = rand(1, 2);
      chosen.push({ prod, qty });
    }
    if (!chosen.length) continue;

    const orderItems = chosen.map(({ prod, qty }) => ({
      name: prod.name,
      qty,
      image: prod.images?.[0],
      price: prod.price,
      product: prod._id,
    }));

    const itemsPrice = round2(orderItems.reduce((a, it) => a + it.price * it.qty, 0));
    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const taxPrice = round2(TAX_RATE * itemsPrice);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    const paymentMethod = Math.random() < 0.55 ? 'EVC Plus' : 'Cash on Delivery';
    const createdAt = daysAgo(rand(1, 35));

    // status distribution: ~20% pending, ~30% paid, ~40% delivered, ~10% cancelled
    const roll = Math.random();
    let status = 'Pending', isPaid = false, isDelivered = false, paidAt, deliveredAt, paymentResult;

    if (roll < 0.1) {
      status = 'Cancelled';
      cancelled++;
    } else if (roll < 0.3) {
      status = 'Pending';
      pending++;
    } else if (roll < 0.6) {
      status = 'Paid';
      isPaid = true;
      paidAt = new Date(createdAt.getTime() + rand(1, 48) * 3600 * 1000);
      paidCount++;
    } else {
      status = 'Delivered';
      isPaid = true;
      isDelivered = true;
      paidAt = new Date(createdAt.getTime() + rand(1, 24) * 3600 * 1000);
      deliveredAt = new Date(paidAt.getTime() + rand(24, 120) * 3600 * 1000);
      paidCount++;
      delivered++;
    }

    if (isPaid) {
      paymentMethod === 'EVC Plus' ? evc++ : cod++;
      paymentResult =
        paymentMethod === 'EVC Plus'
          ? { transactionId: `EVC${rand(100000, 999999)}`, status: 'Completed', update_time: paidAt.toISOString(), payer_phone: `61${rand(1000000, 9999999)}` }
          : { status: 'Manual', update_time: String(paidAt.getTime()) };
    }

    const order = await Order.create({
      user: buyer._id,
      orderItems,
      shippingAddress: {
        streetName: pick(streets),
        city: 'Mogadishu',
        district: pick(districts),
        landmark: pick(landmarks),
      },
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      isDelivered,
      deliveredAt,
      status,
    });

    // Backdate the row so the dashboard shows history (timestamps:false skips the hook)
    await Order.updateOne(
      { _id: order._id },
      { $set: { createdAt, updatedAt: deliveredAt || paidAt || createdAt } },
      { timestamps: false }
    );

    // reflect the sale in stock (best-effort, floored at 0)
    for (const { prod, qty } of chosen) {
      await Product.updateOne({ _id: prod._id }, { $inc: { countInStock: -qty } });
      await Product.updateOne({ _id: prod._id, countInStock: { $lt: 0 } }, { $set: { countInStock: 0 } });
    }
  }

  console.log(`Added ${ORDERS} orders → ${paidCount} paid (${evc} EVC Plus / ${cod} Cash), ${delivered} delivered, ${pending} pending, ${cancelled} cancelled`);

  const now = {
    products: await Product.countDocuments(),
    users: await User.countDocuments(),
    orders: await Order.countDocuments(),
  };
  console.log(`\nDB now → ${now.products} products, ${now.users} users, ${now.orders} orders\n`);

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
