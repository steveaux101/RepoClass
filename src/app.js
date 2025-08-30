import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";  // ✅ only once

dotenv.config();

const app = express();

// Security & core middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200,                 // limit each IP
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Health check
app.get("/v1/health", (_req, res) => {
    res.json({
        ok: true,
        service: "user-management-service",
        ts: new Date().toISOString(),
    });
});

// TODO: Mount routes here (e.g., userRoutes)
// import userRoutes from "./routes/userRoutes.js";
// app.use("/v1/users", userRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;

// ✅ Only one connectDB + one PORT
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ User Management API running at http://localhost:${PORT}`);
    });
});
