import express from "express";
import Subscriber from "../models/Subscriber.js";

const router = express.Router();

// SAVE EMAIL
router.post("/", async (req, res) => {

  try {

    const exists =
      await Subscriber.findOne({
        email: req.body.email
      });

    if (exists) {
      return res.json(exists);
    }

    const subscriber =
      await Subscriber.create({
        email: req.body.email
      });

    res.status(201).json(subscriber);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

// GET ALL
router.get("/", async (req, res) => {

  try {

    const subscribers =
      await Subscriber.find()
      .sort({ createdAt: -1 });

    res.json(subscribers);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

export default router;