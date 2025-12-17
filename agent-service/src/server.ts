import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

// ESM + NodeNext: local imports must include .js
import agentsRoutes from "./routes/agents.js";
import settlementsRoutes from "./routes/settlements.js";

const app = express();

// Enable CORS for frontend (running on port 3001)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));

app.use(express.json());

// Basic health endpoint for smoke testing
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount routes
app.use("/agents", agentsRoutes);
app.use("/settlement", settlementsRoutes);

// Start server
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Agent service listening on http://localhost:${PORT}`);
});
