import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import questionRoutes from './routes/questionroutes.mjs';

// Environment config
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes with full extensions
import authRoutes from "./routes/authRoutes.mjs";
import taskRoutes from "./routes/taskRoutes.mjs";
import resumeRoutes from "./routes/resumeRoutes.mjs";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} request received at ${req.originalUrl}`);
  next(); // Proceed to the next middleware/route handler
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Routes
app.use("/upload-resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/questions', questionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
