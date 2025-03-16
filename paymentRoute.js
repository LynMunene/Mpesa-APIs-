const express = require('express');
const router = express.Router();
const { initiateSTKPush, handleCallback } = require('../controllers/paymentController');
const { generatetoken } = require('../middleware/safaricomToken');

router.post('/stk', generatetoken, async (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ message: 'Phone and amount are required' });
  }

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const token = req.token;

  try {
    const stkResponse = await initiateSTKPush(phone, amount, shortcode, passkey, token);
    res.status(200).json(stkResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/callback", async (req, res) => {
  try {
    const callbackData = req.body;
    const payment = await handleCallback(callbackData);
    res.status(200).json({ message: 'Payment saved successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;