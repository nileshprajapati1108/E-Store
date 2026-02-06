import express from "express";
import Order from "../models/orderModel.js";
import AddToCart from "../models/addToCart.js";

const router = express.Router();

// Create order after successful payment
router.post("/create", async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentId, razorpayOrderId } = req.body;

    if (!userId || !items || !totalAmount || !paymentId || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      paymentId,
      razorpayOrderId,
      status: "confirmed",
      paymentStatus: "completed",
    });

    await newOrder.save();

    // Clear the user's cart after successful order
    await AddToCart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user orders
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all orders (admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update order status (admin)
router.put("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
