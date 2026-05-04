import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const clearProductImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Resetting all product images to default...');
    
    // Set images to empty array so the frontend uses its default fallback
    const result = await Product.updateMany({}, { $set: { images: [] } });
    
    console.log(`${result.modifiedCount} Products updated. All images removed! 🧼✨`);
    process.exit();
  } catch (error) {
    console.error('Error clearing images:', error);
    process.exit(1);
  }
};

clearProductImages();
