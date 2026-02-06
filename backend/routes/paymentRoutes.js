import express from "express";
import razorpayInstance from "../config/razorpay.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body;
  console.log("Create order request:", { amount, currency });

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Convert amount to smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `order_${Date.now()}`,
    };

    console.log("Razorpay options:", options);

    const order = await razorpayInstance.orders.create(options);
    console.log("Order created:", order);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay error:", error.message, error);
    res.status(500).json({ error: error.message || "Error creating RazorPay order" });
  }
});

export default router;
