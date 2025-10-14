// app.js (ESM version)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import returnRoutes from "./routes/returns.js";
import accountRoutes from "./routes/accountRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import pesapalRoutes from "./routes/pesapalRoutes.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// ✅ Connect to DB
connectDB();

const app = express();

// ✅ FIX CORS — Must come before all routes
app.use(
  cors({
    origin: [
      "https://manwellfrontend-6scg.onrender.com", // Your deployed frontend
      "http://localhost:3000", // For local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/pesapal", pesapalRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/contact", contactRoutes);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ Manwell Backend API is running...");
});

// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
