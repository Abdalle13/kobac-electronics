import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!dbUri) {
      console.error('Error: MONGODB_URI or MONGO_URI is missing in .env'.red.bold);
      process.exit(1);
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;
