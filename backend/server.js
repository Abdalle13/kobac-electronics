import 'dotenv/config';
import express from 'express';
import colors from 'colors';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import path from 'path';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { authLimiter } from './middleware/rateLimiter.js';

// Fail fast if the token secret is missing — no insecure fallback.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to your environment before starting the server.');
}

// Connect to database
connectDB();

const app = express();

// Security headers
app.use(helmet());

// CORS — allow localhost, any *.vercel.app deployment, and whatever FRONTEND_URL
// lists (comma-separated, trailing slashes ignored).
const stripSlash = (u) => (u || '').trim().replace(/\/+$/, '');
const devOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(stripSlash)
  .filter(Boolean);
const allowlist = [...configuredOrigins, ...devOrigins];

const isAllowedOrigin = (origin) => {
  const clean = stripSlash(origin);
  if (allowlist.includes(clean)) return true;
  try {
    return new URL(clean).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, cb) => {
    // Requests with no Origin: curl, server-to-server, Vercel rewrites
    if (!origin) return cb(null, true);
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: FRONTEND_URL not set — CORS falls back to localhost + *.vercel.app only.'.yellow.bold);
}

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Throttle auth endpoints (brute-force protection)
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/users/reset-password', authLimiter);
app.use('/api/contact', authLimiter);

// Main Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment/evcplus', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);

// Make the uploads folder static so it can be accessed in browser via /uploads
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Kobac Electronics API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen locally, Vercel Serverless will import the app instead
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
  });
}

// Export the Express API for Vercel
export default app;
