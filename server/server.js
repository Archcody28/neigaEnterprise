import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import path from "path";
import fs from "fs";
import subscriberRoutes
from "./routes/subscribers.js";

// Database
import connectDB from "./config/db.js";

// Routes
import homeRoutes from "./routes/home.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";

// Config
dotenv.config();

// Initialize app
const app = express();

// Connect Database
connectDB();

// Create uploads folder if it doesn't exist
const uploadsPath = path.resolve("uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);


app.use(cors({
  origin: true,
  credentials: true
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, try again later.",
});

app.use(limiter);

// Body Parser
app.use(express.json());

// Sanitize Data
app.use(mongoSanitize());

// Prevent XSS Attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Static Folder
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/subscribers", subscriberRoutes);
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(
    `[${new Date().toISOString()}]`,
    err.stack || err.message
  );

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});