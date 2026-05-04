import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const adminId = '69ee1a7c3f84c95f2e390086';

const products = [
  {
    user: adminId,
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Phone',
    description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and the most advanced camera system yet. Perfect for high-performance users in Somalia.',
    price: 1399,
    countInStock: 12,
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '8GB', storage: '256GB', processor: 'A17 Pro' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Phone',
    description: 'The definitive Android experience with Titanium build, Built-in S Pen, and Galaxy AI features. The most popular choice for business professionals.',
    price: 1299,
    countInStock: 8,
    images: ['https://images.unsplash.com/photo-1707246452294-82a174092f6b?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '12GB', storage: '512GB', processor: 'Snapdragon 8 Gen 3' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'iPhone 15',
    brand: 'Apple',
    category: 'Phone',
    description: 'Featuring Dynamic Island, 48MP Main camera, and USB-C. Great value for users who want the latest Apple tech.',
    price: 899,
    countInStock: 15,
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '6GB', storage: '128GB', processor: 'A16 Bionic' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Samsung Galaxy A54 5G',
    brand: 'Samsung',
    category: 'Phone',
    description: 'Awesome camera, awesome screen, and long-lasting battery. The best-selling mid-range phone in Somalia.',
    price: 450,
    countInStock: 25,
    images: ['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '8GB', storage: '128GB', processor: 'Exynos 1380' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    category: 'Phone',
    description: 'The all-pro Google phone with the best camera AI and 7 years of updates. Stunning design and performance.',
    price: 999,
    countInStock: 5,
    images: ['https://images.unsplash.com/photo-1697223406240-880016e1f0e4?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '12GB', storage: '256GB', processor: 'Google Tensor G3' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Redmi Note 13 Pro+',
    brand: 'Xiaomi',
    category: 'Phone',
    description: '200MP camera, 120W HyperCharge, and IP68 water resistance. Incredible specs for a great price.',
    price: 399,
    countInStock: 20,
    images: ['https://images.unsplash.com/photo-1662483861218-477042a35639?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '12GB', storage: '512GB', processor: 'Dimensity 7200-Ultra' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Samsung Galaxy Z Fold 5',
    brand: 'Samsung',
    category: 'Phone',
    description: 'The ultimate foldable phone for productivity. A massive screen that fits in your pocket.',
    price: 1799,
    countInStock: 3,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '12GB', storage: '512GB', processor: 'Snapdragon 8 Gen 2' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'iPad Pro 11-inch (M2)',
    brand: 'Apple',
    category: 'Tablet',
    description: 'The most advanced tablet in the world with M2 chip, Liquid Retina display, and Apple Pencil hover.',
    price: 799,
    countInStock: 7,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '8GB', storage: '128GB', processor: 'Apple M2' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'MacBook Air M2',
    brand: 'Apple',
    category: 'Laptop',
    description: 'Strikingly thin and fast. The best laptop for students and professionals in Somalia.',
    price: 1199,
    countInStock: 10,
    images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '8GB', storage: '256GB', processor: 'Apple M2' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'Watch',
    description: 'Smarter, brighter, and mightier. Featuring the new S9 chip and Double Tap gesture.',
    price: 399,
    countInStock: 12,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: 'N/A', storage: '64GB', processor: 'S9 SiP' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'AirPods Pro (2nd Gen)',
    brand: 'Apple',
    category: 'Headphones',
    description: 'Up to 2x more Active Noise Cancellation and Adaptive Audio for a magical listening experience.',
    price: 249,
    countInStock: 30,
    images: ['https://images.unsplash.com/photo-1588423770574-91023ad30dc2?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: 'N/A', storage: 'N/A', processor: 'H2 Chip' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Samsung Galaxy Watch 6',
    brand: 'Samsung',
    category: 'Watch',
    description: 'Monitor your health and track your workouts with a larger display and improved battery.',
    price: 299,
    countInStock: 15,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '2GB', storage: '16GB', processor: 'Exynos W930' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'PlayStation 5 (Disc Edition)',
    brand: 'Sony',
    category: 'Gaming',
    description: 'Experience lightning-fast loading and deeper immersion with 4K gaming and 120Hz support.',
    price: 499,
    countInStock: 6,
    images: ['https://images.unsplash.com/photo-1606813907291-d86ebb9474ad?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: '16GB GDDR6', storage: '825GB SSD', processor: 'AMD Ryzen Zen 2' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'Headphones',
    description: 'The best noise-canceling headphones in the world. Industry-leading audio quality and comfort.',
    price: 399,
    countInStock: 10,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: 'N/A', storage: 'N/A', processor: 'V1 / QN1' },
    status: 'Active'
  },
  {
    user: adminId,
    name: 'Magsafe Wireless Charger',
    brand: 'Apple',
    category: 'Accessories',
    description: 'Snap on for fast wireless charging. Compatible with all iPhone 12 or newer models.',
    price: 39,
    countInStock: 50,
    images: ['https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=800'],
    technicalSpecs: { ram: 'N/A', storage: 'N/A', processor: 'N/A' },
    status: 'Active'
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Append products to existing inventory
    console.log('Adding new premium products...');

    await Product.insertMany(products);
    console.log('15 Products Seeded Successfully! 🚀');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
