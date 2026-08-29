import express from 'express';

const router = express.Router();

/**
 * Simulated EVC Plus / WaafiPay mobile-money gateway.
 *
 * This is a PORTFOLIO simulation - no real money moves - but it mirrors how the
 * real Hormuud WaafiPay flow behaves: the customer gets an STK push on their
 * phone, enters their PIN, and the gateway returns a signed transaction result.
 *
 * Rules:
 *   - phone must be a valid Somali mobile number   -> else INVALID_ACCOUNT
 *   - amount must be positive                       -> else INVALID_AMOUNT
 *   - PIN must equal the demo PIN (EVC_DEMO_PIN, default "1234") -> else INVALID_PIN
 *   - otherwise -> APPROVED
 */

const DEMO_PIN = process.env.EVC_DEMO_PIN || '1234';

// Normalise "+252 61 1234567", "025261...", "61-123-4567" -> "611234567"
const normalizePhone = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('252')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

// Hormuud / Somali mobile: 9 digits, starts with 6, 7 or 9
const isValidSomaliMobile = (digits) => /^[679]\d{8}$/.test(digits);

const randomRef = (prefix) =>
  prefix + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

// @desc    Request an EVC Plus payment (STK push + PIN confirmation)
// @route   POST /api/payment/evcplus
// @access  Public (simulated external gateway)
router.post('/', async (req, res) => {
  const { phoneNumber, amount, pin } = req.body;

  const phone = normalizePhone(phoneNumber);
  const numericAmount = Number(amount);

  // --- Validation (mirrors gateway pre-checks) ---
  if (!phoneNumber || !isValidSomaliMobile(phone)) {
    return res.status(400).json({
      state: 'FAILED',
      errorCode: 'INVALID_ACCOUNT',
      message: 'Lambarka telefoonka waa khalad. Isticmaal lambar EVC Plus sax ah.',
    });
  }

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({
      state: 'FAILED',
      errorCode: 'INVALID_AMOUNT',
      message: 'Qadarka lacagta waa khalad.',
    });
  }

  if (!/^\d{4}$/.test(String(pin || '')) || String(pin) !== DEMO_PIN) {
    return res.status(400).json({
      state: 'FAILED',
      errorCode: 'INVALID_PIN',
      message: 'PIN-ka aad gelisay waa qalad. Fadlan mar kale isku day.',
    });
  }

  // --- Simulate the STK push + customer confirming on their handset ---
  await new Promise((resolve) => setTimeout(resolve, 2200));

  // --- Success: return a WaafiPay-style signed result ---
  return res.status(200).json({
    state: 'APPROVED',
    responseCode: '2001',
    message: 'Lacag bixintu waa guulaysatay.',
    params: {
      transactionId: randomRef('EVC'),
      referenceId: randomRef('WAAFI'),
      issuerTransactionId: randomRef('HRM'),
      txAmount: numericAmount.toFixed(2),
      currency: 'USD',
      accountNo: phone,
      paymentMethod: 'MWALLET_ACCOUNT',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
