import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const adminId = '69ee1a7c3f84c95f2e390086';

const iphones = [
  // iPhone 11 Series
  { user: adminId, name: 'iPhone 11', brand: 'Apple', category: 'Phone', description: 'Dual-camera system. All-day battery life. The toughest glass in a smartphone.', price: 499, countInStock: 10, images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 11 Pro', brand: 'Apple', category: 'Phone', description: 'Triple-camera system. Super Retina XDR display. A13 Bionic chip.', price: 599, countInStock: 5, images: ['https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 11 Pro Max', brand: 'Apple', category: 'Phone', description: 'Largest display and longest battery life in the iPhone 11 series.', price: 699, countInStock: 4, images: ['https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 12 Series
  { user: adminId, name: 'iPhone 12', brand: 'Apple', category: 'Phone', description: '5G speed. A14 Bionic. Ceramic Shield. OLED display on every model.', price: 599, countInStock: 8, images: ['https://images.unsplash.com/photo-1603919306384-9934bf55f560?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 12 Pro', brand: 'Apple', category: 'Phone', description: 'Stainless steel design. LiDAR Scanner. Pro camera system.', price: 699, countInStock: 6, images: ['https://images.unsplash.com/photo-1605236453023-97216ca6a72b?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 12 Pro Max', brand: 'Apple', category: 'Phone', description: 'The biggest Pro camera system upgrade yet.', price: 799, countInStock: 3, images: ['https://images.unsplash.com/photo-1605236453023-97216ca6a72b?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 13 Series
  { user: adminId, name: 'iPhone 13', brand: 'Apple', category: 'Phone', description: 'Most advanced dual-camera system. A15 Bionic. A huge leap in battery life.', price: 699, countInStock: 12, images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 13 Pro', brand: 'Apple', category: 'Phone', description: 'ProMotion display. Cinematic mode. Massive camera upgrade.', price: 799, countInStock: 7, images: ['https://images.unsplash.com/photo-1633113089631-6456cccaadad?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 13 Pro Max', brand: 'Apple', category: 'Phone', description: 'The ultimate iPhone experience with ProMotion and huge battery.', price: 899, countInStock: 5, images: ['https://images.unsplash.com/photo-1633113089631-6456cccaadad?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 14 Series
  { user: adminId, name: 'iPhone 14', brand: 'Apple', category: 'Phone', description: 'Vibrant OLED display. Action mode for smooth video. Safety features like Crash Detection.', price: 799, countInStock: 15, images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 14 Plus', brand: 'Apple', category: 'Phone', description: 'Big 6.7-inch display and the longest battery life ever in an iPhone.', price: 899, countInStock: 10, images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 14 Pro', brand: 'Apple', category: 'Phone', description: 'Dynamic Island. 48MP Main camera. Always-On display.', price: 999, countInStock: 8, images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 14 Pro Max', brand: 'Apple', category: 'Phone', description: 'The ultimate iPhone 14 with the largest display and Pro features.', price: 1099, countInStock: 6, images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 15 Series
  { user: adminId, name: 'iPhone 15', brand: 'Apple', category: 'Phone', description: 'Dynamic Island, 48MP Main camera, and USB-C.', price: 899, countInStock: 20, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 15 Plus', brand: 'Apple', category: 'Phone', description: 'Large 6.7-inch screen with all the latest features.', price: 999, countInStock: 12, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 15 Pro', brand: 'Apple', category: 'Phone', description: 'Titanium design. A17 Pro chip. Customizable Action button.', price: 1099, countInStock: 10, images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'Phone', description: 'The most powerful iPhone ever with 5x Telephoto camera.', price: 1199, countInStock: 8, images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 16 Series (Future Concepts)
  { user: adminId, name: 'iPhone 16', brand: 'Apple', category: 'Phone', description: 'Coming Soon. The next generation of iPhone with advanced AI integration.', price: 999, countInStock: 0, images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'], status: 'Active' },
  { user: adminId, name: 'iPhone 16 Pro Max', brand: 'Apple', category: 'Phone', description: 'Pre-order the future. The ultimate smartphone experience.', price: 1299, countInStock: 0, images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'], status: 'Active' },

  // iPhone 17 Series (Visionary Concepts)
  { user: adminId, name: 'iPhone 17 Pro Max', brand: 'Apple', category: 'Phone', description: 'Beyond boundaries. Featuring under-display Face ID and next-gen silicon.', price: 1499, countInStock: 0, images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'], status: 'Active' }
];

const seedIphones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Adding the Ultimate iPhone Collection...');
    await Product.insertMany(iphones);
    console.log('All iPhones Added Successfully! 🍎🔥');
    process.exit();
  } catch (error) {
    console.error('Error seeding iPhones:', error);
    process.exit(1);
  }
};

seedIphones();
