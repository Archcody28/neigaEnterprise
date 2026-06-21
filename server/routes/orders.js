import { protect, adminOnly } from "../middleware/auth.js";
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// health check
router.get("/", (req, res) => {
  res.send("Orders API working");
});

// get all orders
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// create order
router.post("/", async (req, res) => {
  try {
    const { items, total, customerName, customerPhone, note } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        message: "No order items provided"
      });
    }

    const order = await Order.create({
      items,
      total,
      customerName,
      customerPhone,
      note
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// update order status
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;