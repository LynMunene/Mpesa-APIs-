const axios = require('axios');
const Buffer = require('buffer').Buffer;
const Payment = require('../models/paymentModel');
require('dotenv').config();

const generatePassword = (shortcode, passkey, timestamp) => {
  return Buffer.from(shortcode + passkey + timestamp).toString('base64');
};

const generateTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
};

const initiateSTKPush = async (phone, amount, shortcode, passkey, token) => {
  const timestamp = generateTimestamp();
  const password = generatePassword(shortcode, passkey, timestamp);

  try {
    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortcode,
        PhoneNumber: `254${phone}`,
        CallBackURL: 'https://mydomain.com/callback',
        AccountReference: `254${phone}`,
        TransactionDesc: 'Payment for services',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

const handleCallback = async (callbackData) => {
  if (!callbackData.Body.stkCallback.CallbackMetadata) {
    throw new Error('Invalid callback data');
  }

  const phone = callbackData.Body.stkCallback.CallbackMetadata.Item[3].value;
  const transaction_id = callbackData.Body.stkCallback.CallbackMetadata.Item[1].value;
  const amount = callbackData.Body.stkCallback.CallbackMetadata.Item[0].value;

  const payment = new Payment({
    number: phone,
    transaction_id,
    amount
  });

  await payment.save();
  return payment;
};

module.exports = { initiateSTKPush, handleCallback };