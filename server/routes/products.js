import path from "path";
import { protect, adminOnly } from "../middleware/auth.js";
import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

// ================= MULTER =================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve("uploads"));
  },

  filename(req, file, cb) {
    const safeName = file.originalname
  .replace(/\s+/g, "-")
  .replace(/[^\w.-]/g, "");

cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({
  storage,

  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Images only"));
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ================= HEALTH CHECK =================
router.get("/", (req, res) => {
  res.send("Products API working");
});

// ================= GET ALL PRODUCTS =================
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ================= CREATE PRODUCT =================
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      featured: req.body.featured === "true"
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ================= DELETE PRODUCT =================
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;