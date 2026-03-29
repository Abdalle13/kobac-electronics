import express from 'express';

const router = express.Router();

// @desc    Mock EVC Plus endpoint simulating mobile money payment
// @route   POST /api/payment/evcplus
// @access  Public (simulated external trigger)
router.post('/', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ message: 'Phone number and amount required for EVC Plus' });
  }

  // Simulate network delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate success payload
  const transactionId = 'EVC' + Math.floor(Math.random() * 1000000000);

  res.json({
    status: 'COMPLETED',
    transactionId: transactionId,
    amount: amount,
    payer_phone: phoneNumber,
    update_time: new Date().toISOString(),
  });
});

export default router;
