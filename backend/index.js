import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// Import models for legacy routes
import Product from "./models/productModel.js";

const app = express();
const PORT = 3000;

// Middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect(
    "mongodb+srv://nileshprajapati1108:Test1234@cluster0.ombpnhl.mongodb.net/estore"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to E-Store Backend");
});

// API Routes

// User Routes - /api/user/*
app.use("/api/user", userRoutes);

// Product Routes - /api/product/*
app.use("/api/product", productRoutes);

// Cart Routes - /api/cart/*
app.use("/api/cart", cartRoutes);

// Order Routes - /api/orders/*
app.use("/api/orders", orderRoutes);

// Wishlist Routes - /api/wishlist/*
app.use("/api/wishlist", wishlistRoutes);

// Review Routes
app.use("/api/review", reviewRoutes);
app.use("/api/reviews", reviewRoutes);

// Coupon Routes
app.use("/api/coupon", couponRoutes);
app.use("/api/coupons", couponRoutes);

// Admin Routes - /api/admin/*
app.use("/api/admin", adminRoutes);

// Contact Routes - /api/contact/*
app.use("/api/contact", contactRoutes);

// Payment Route
app.use("/", paymentRoutes);

//Additional Routes for Backward Compatibility 

// Legacy: Remove product (old endpoint)
app.delete("/api/product-remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete({ _id: id });
    return res.status(200).json({
      success: true,
      message: "Product is deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Products Search Route
app.get("/api/products/search", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ];
    }
    
    if (category && category !== "All") {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let sort = {};
    switch (sortBy) {
      case "price-low":
        sort.price = 1;
        break;
      case "price-high":
        sort.price = -1;
        break;
      case "rating":
        sort.rating = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      default:
        sort.createdAt = -1;
    }
    
    const products = await Product.find(query).sort(sort);
    
    return res.status(200).json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Featured Products Route
app.get("/api/products/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Categories Route
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
