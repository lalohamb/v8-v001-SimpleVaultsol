import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

// ESM + NodeNext: local imports must include .js
import agentsRoutes from "./routes/agents.js";
import settlementsRoutes from "./routes/settlements.js";
import { startVaultEventListener } from "./listeners/vaultEvents.js";

const app = express();

// Enable CORS for frontends
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:3002",
  "http://simplevault.165.22.233.86.sslip.io",
  "http://o08ko0kc4sgckcgsc0888gsg.165.22.233.86.sslip.io"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Root endpoint
app.get("/", (_req, res) => {
  res.json({ service: "Cronos Sentinel AI Vault", status: "running" });
});

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
  console.log(`CORS enabled for: ${allowedOrigins.join(", ")}`);
  
  // Start blockchain event listeners
  startVaultEventListener().catch((err) => {
    console.error("Failed to start vault event listener:", err);
  });
});
