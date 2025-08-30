import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

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
        max: 200,                 // per-IP limit
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

// API routes
app.use("/users", userRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;

// Start server immediately (so /v1/health works even if DB is down)
app.listen(PORT, () => {
    console.log(`✅ User Management API running at http://localhost:${PORT}`);
});

// Connect to MongoDB in the background with simple retry
(async function mongoBoot() {
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await connectDB();
            return;
        } catch (e) {
            console.error(`Mongo connect attempt ${attempt} failed. Retrying in 3s...`);
            await new Promise((r) => setTimeout(r, 3000));
        }
    }
    console.error("❌ Could not connect to Mongo after 5 attempts (server still running for /v1/health).");
})();
