import express from "express";
import Wishlist from "../models/wishlistModel.js";

const router = express.Router();

// Add to wishlist
router.post("/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user wishlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.find({ userId }).populate("productId");

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Remove from wishlist
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Wishlist.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Check if product is in wishlist
router.get("/check/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const item = await Wishlist.findOne({ userId, productId });

    return res.status(200).json({
      success: true,
      inWishlist: !!item,
      wishlistItemId: item?._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
