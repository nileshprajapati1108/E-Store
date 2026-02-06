import express from "express";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Get Dashboard Stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments({ role: "user" });

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Total Orders & Revenue
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // This month stats
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // New users this month
    const newUsersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: firstDayOfMonth },
    });

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: "confirmed" });

    // Low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthlyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        newUsersThisMonth,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Recent Orders for Dashboard
router.get("/dashboard/recent-orders", async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name img price")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      orders: recentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Top Selling Products
router.get("/dashboard/top-products", async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    return res.status(200).json({
      success: true,
      products: topProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Sales Data (Last 7 days)
router.get("/dashboard/sales-chart", async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const salesData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = await Order.aggregate([
          { $match: { createdAt: { $gte: date, $lt: nextDay } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]);

        return {
          date: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: dayOrders[0]?.total || 0,
          orders: dayOrders[0]?.count || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      salesData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Order Status Distribution
router.get("/dashboard/order-status", async (req, res) => {
  try {
    const statusData = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    return res.status(200).json({
      success: true,
      statusData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Users for Admin
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Orders for Admin
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name img")
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

// Update Order Status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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

// Get Category-wise Sales
router.get("/dashboard/category-sales", async (req, res) => {
  try {
    const categorySales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      categorySales,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
