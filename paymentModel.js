const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        number: { type: String, required: true },
        transaction_id: { type: String, required: true },
        amount: { type: Number, required: true }
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;