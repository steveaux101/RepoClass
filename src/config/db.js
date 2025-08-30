// src/config/db.js
import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("❌ MONGO_URI is missing in .env");
        process.exit(1);
    }

    // optional: quiet deprecation warnings
    mongoose.set("strictQuery", true);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000, // fail fast if Mongo isn't reachable
            // You can add auth options here if using Atlas/secured local
            // user: process.env.MONGO_USER,
            // pass: process.env.MONGO_PASS,
        });

        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

        // Helpful connection events
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB runtime error:", err?.message || err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️  MongoDB disconnected");
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err?.message || err);
        process.exit(1);
    }

    // Graceful shutdown
    const shutdown = async (signal) => {
        try {
            await mongoose.connection.close();
            console.log(`🛑 MongoDB connection closed on ${signal}`);
        } finally {
            process.exit(0);
        }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}
