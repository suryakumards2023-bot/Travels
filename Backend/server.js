
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGODB_URI and JWT_SECRET must be configured.");
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Existing middleware
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MK Travels API",
  });
});

// Existing routes — unchanged
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// New callback request route
app.use("/api/contact", contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

// Connect MongoDB and start server
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully.");

  app.listen(PORT, () => {
    console.log(`MK Travels API running on port ${PORT}`);
  });
} catch (error) {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
}
