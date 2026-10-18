import mongoose from 'mongoose';
import colors from 'colors';

// Cache connection across serverless invocations
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!dbUri) {
    console.error('Error: MONGODB_URI or MONGO_URI is missing in environment'.red.bold);
    throw new Error('MONGODB_URI is not defined in environment');
  }

  mongoose.set('strictQuery', false);

  cached.promise = mongoose
    .connect(dbUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
      return conn;
    })
    .catch((error) => {
      cached.promise = null;
      console.error(`MongoDB Connection Error: ${error.message}`.red.bold);
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
