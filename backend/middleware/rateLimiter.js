import rateLimit from 'express-rate-limit';

// Brute-force protection for auth endpoints (login / register).
// Note: on serverless the counter is per-instance, not global — still a
// meaningful speed bump against credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
