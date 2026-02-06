import express from "express";
import multer from "multer";
import Product from "../models/productModel.js";

const router = express.Router();

// Image storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// Add product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, originalPrice, isFeatured } = req.body;

    const img = req.file ? `/uploads/${req.file.filename}` : "";

    if (!name || !description || !price || !img || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields including image and category are required",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      img,
      category,
      brand: brand || "",
      stock: stock || 100,
      originalPrice: originalPrice || null,
      isFeatured: isFeatured === "true" || isFeatured === true,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all products
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();

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

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update product
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, brand, stock, originalPrice, isFeatured } = req.body;

    const updateData = {
      name,
      description,
      price,
      category,
      brand: brand || "",
      stock: stock || 100,
      originalPrice: originalPrice || null,
      isFeatured: isFeatured === "true" || isFeatured === true,
    };

    if (req.file) {
      updateData.img = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Remove product
router.delete("/remove/:id", async (req, res) => {
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

// Search products
router.get("/", async (req, res) => {
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

// Get featured products
router.get("/featured/list", async (req, res) => {
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

// Get categories
router.get("/categories/list", async (req, res) => {
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

export default router;
