import express from "express";
import AddToCart from "../models/addToCart.js";

const router = express.Router();

// Add to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, productPrice, quantity } = req.body;

    const cartItem = await AddToCart.findOne({ userId, productId });
    if (cartItem) {
      cartItem.quantity += quantity || 1;
      await cartItem.save();
      return res.status(200).json({
        success: true,
        message: "Product quantity updated in cart",
      });
    }

    if (!userId || !productId || !productPrice) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    
    const newCartItem = new AddToCart({
      userId,
      productId,
      productPrice,
      quantity: quantity || 1,
    });
    await newCartItem.save();
    return res.status(201).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get cart items for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await AddToCart.find({ userId }).populate("productId");
    return res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update cart quantity
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await AddToCart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Remove single item from cart
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await AddToCart.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Clear entire cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await AddToCart.deleteMany({ userId });
    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
