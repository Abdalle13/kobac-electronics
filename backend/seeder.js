import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const force = process.argv.includes('--force') || process.argv.includes('-f');

// Guard: this script REPLACES all users, products and orders with the sample
// data. Refuse if the database already has real orders, unless --force is given.
const assertSafe = async (action) => {
  const orderCount = await Order.countDocuments();
  const userCount = await User.countDocuments();
  if (!force && (orderCount > 0 || userCount > users.length)) {
    console.error(''.red);
    console.error(`  Refusing to ${action}: the database has ${orderCount} order(s) and ${userCount} user(s).`.red.bold);
    console.error('  This would permanently delete them. Re-run with --force if you are sure:'.red);
    console.error(`    npm run data:${action === 'seed' ? 'import' : 'destroy'} -- --force`.yellow);
    console.error(''.red);
    await mongoose.disconnect();
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await assertSafe('seed');

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // User.create in a loop so the pre('save') bcrypt hook hashes each password
    const createdUsers = [];
    for (const u of users) {
      createdUsers.push(await User.create(u));
    }

    const adminUser = createdUsers[0]._id;
    await Product.insertMany(products.map((p) => ({ ...p, user: adminUser })));

    console.log('Data imported.'.green.inverse);
    console.log('');
    users.forEach((u) => console.log(`  ${u.role.padEnd(8)} ${u.email} / ${u.password}`.cyan));
    console.log('');
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await assertSafe('destroy');

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed.'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
