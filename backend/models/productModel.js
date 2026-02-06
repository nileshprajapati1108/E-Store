import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Books", "Beauty", "Toys", "Other"],
    default: "Other"
  },
  brand: { type: String, default: "" },
  stock: { type: Number, default: 100 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  originalPrice: { type: Number, default: null },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
