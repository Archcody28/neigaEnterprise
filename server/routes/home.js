import path from "path";
import { protectAdmin } from "../middleware/auth.js";
import express from "express";
import multer from "multer";

import HomeProduct from "../models/HomeProduct.js";
import Testimonial from "../models/Testimonial.js";

const router = express.Router();



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

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});

// ================= HOME PRODUCTS =================

// PUBLIC — homepage needs this
router.get("/products", async (req, res) => {
  try {
    const items = await HomeProduct.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ADMIN ONLY
router.post(
  "/products",
  protectAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const item = await HomeProduct.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.file ? `/uploads/${req.file.filename}` : ""
      });

      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// ADMIN ONLY
router.delete("/products/:id", protectAdmin, async (req, res) => {
  try {
    await HomeProduct.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ================= TESTIMONIALS =================

// PUBLIC — homepage needs this
router.get("/testimonials", async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ADMIN ONLY
router.post(
  "/testimonials",
  protectAdmin,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const item = await Testimonial.create({
        frontImage: req.files?.frontImage
          ? `/uploads/${req.files.frontImage[0].filename}`
          : "",
        backImage: req.files?.backImage
          ? `/uploads/${req.files.backImage[0].filename}`
          : "",
        quote: req.body.quote,
        author: req.body.author
      });

      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// ADMIN ONLY
router.delete("/testimonials/:id", protectAdmin, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;