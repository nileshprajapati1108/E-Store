import mongoose from "mongoose";

const addToCart = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  
});

export default mongoose.model("AddToCart", addToCart);
